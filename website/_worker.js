// 肌肉会飞 - Cloudflare Pages _worker.js（单文件 Functions）
// /api/* 交给 Hono 后端，其他路由返回静态资源（ASSETS）
// 开启 nodejs_compat 保留 crypto.scryptSync/randomBytes，旧用户密码零迁移
import { Hono } from 'hono';
import { neon, Client } from '@neondatabase/serverless';
import crypto from 'node:crypto';

const app = new Hono();

let _sql = null, _rawSql = null;
function getSql(env) {
  if (!_sql && env.DATABASE_URL) {
    _rawSql = neon(env.DATABASE_URL);
    _sql = wrapRetry(_rawSql);
  }
  return _sql;
}
// 事务批量：多个查询合并为一次 HTTPS 往返（外层包超时+重试）
function batchTx(queries) {
  return dbRetry(() => _rawSql.transaction(queries));
}

// Neon serverless 查询走 HTTPS fetch，但 Workers 出站 fetch 默认无超时，
// 且每个新 Worker 实例首连 Cloudflare→Neon 链路实测需 6-18 秒激活（激活后毫秒级）。
// 策略：每次查询 6s 硬超时，失败最多重试 2 次（间隔 1s）——首轮激活链路，后续成功。
// 最坏路径 6+1+6+1+6=20s，前端登录超时 22s，保证用户能等到成功结果。
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const QUERY_TIMEOUT = 6000;
function withTimeout(promise) {
  return Promise.race([
    promise,
    sleep(QUERY_TIMEOUT).then(() => { throw new Error('database query timeout'); })
  ]);
}
async function dbRetry(fn) {
  let err;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await withTimeout(fn());
    } catch (e) {
      err = e;
      const m = String((e && e.message) || e || '');
      const isConnErr = /timeout|timed out|connect|fetch|network|520|522|524|ECONNRESET|ENOTFOUND|terminating/i.test(m);
      if (!isConnErr || attempt === 2) throw e;
      await sleep(1000);
    }
  }
  throw err;
}
function wrapRetry(rawSql) {
  return new Proxy(rawSql, {
    apply(target, thisArg, args) { return dbRetry(() => Reflect.apply(target, thisArg, args)); }
  });
}

// 建表：每个 Worker 实例只跑一次（DDL 三语句合并为单条事务请求）；
// 登录路径完全不调用——能登录说明表必然存在，省掉每轮登录 3 次串行往返。
let _ensured = null;
function ensureTables(sql) {
  if (!_ensured) {
    _ensured = batchTx([
      _rawSql`CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, created_at BIGINT NOT NULL)`,
      _rawSql`CREATE TABLE IF NOT EXISTS tokens(token TEXT PRIMARY KEY, username TEXT NOT NULL, created_at BIGINT NOT NULL)`,
      _rawSql`CREATE TABLE IF NOT EXISTS userdata(username TEXT PRIMARY KEY, data JSONB NOT NULL, synced_at BIGINT NOT NULL)`
    ]).catch((e) => { _ensured = null; throw e; });
  }
  return _ensured;
}

function hashPassword(password, salt) {
  return crypto.scryptSync(String(password), salt, 32).toString('hex');
}
async function authUser(c) {
  const h = c.req.header('Authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return null;
  const sql = getSql(c.env);
  if (!sql) return null;
  const rows = await sql`SELECT username FROM tokens WHERE token=${token}`;
  return rows[0] ? rows[0].username : null;
}

// ---------- API 路由 ----------
app.use('/api/*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (c.req.method === 'OPTIONS') return c.body(null, 204);
  await next();
});

// 解析登录标识：邮箱模式（loginType=email 或账号含 @）统一小写作为主键；
// 邮箱本身可直接作为 users 主键（TEXT 列），旧用户名账号零迁移。
function resolveAccount(body) {
  const raw = String((body && body.username) || '').trim();
  const isEmail = body.loginType === 'email' || raw.includes('@');
  return { account: isEmail ? raw.toLowerCase() : raw, isEmail };
}
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.post('/api/register', async (c) => {
  try {
    const body = await c.req.json();
    const { account, isEmail } = resolveAccount(body);
    const password = body && body.password;
    if (!account || !password) return c.json({ ok: false, msg: '账号和密码不能为空' });
    if (isEmail) {
      if (!EMAIL_RE.test(account) || account.length > 120) return c.json({ ok: false, msg: '邮箱格式不正确' });
    } else {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(account)) return c.json({ ok: false, msg: '用户名需为3-20位字母/数字/下划线' });
    }
    if (String(password).length < 6) return c.json({ ok: false, msg: '密码至少6位' });
    const sql = getSql(c.env);
    if (!sql) return c.json({ ok: false, msg: '数据库未配置' });
    await ensureTables(sql);
    const exists = await sql`SELECT 1 AS x FROM users WHERE username=${account}`;
    if (exists[0]) return c.json({ ok: false, msg: isEmail ? '该邮箱已注册，直接去登录吧' : '用户名已存在' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const now = Date.now();
    const token = crypto.randomBytes(32).toString('hex');
    // 用户 + token 两条插入合并为一次往返
    await batchTx([
      _rawSql`INSERT INTO users(username,salt,hash,created_at) VALUES(${account},${salt},${hash},${now})`,
      _rawSql`INSERT INTO tokens(token,username,created_at) VALUES(${token},${account},${now})`
    ]);
    return c.json({ ok: true, token, username: account });
  } catch (e) { return c.json({ ok: false, msg: '服务器错误', err: String(e && e.message || e) }); }
});

app.post('/api/login', async (c) => {
  try {
    const body = await c.req.json();
    const { account, isEmail } = resolveAccount(body);
    if (!account) return c.json({ ok: false, msg: '请输入账号' });
    const sql = getSql(c.env);
    if (!sql) return c.json({ ok: false, msg: '数据库未配置' });
    // 登录不建表：最多 2 次数据库往返（查用户 → 写 token）
    const rows = await sql`SELECT salt, hash FROM users WHERE username=${account}`;
    const u = rows[0];
    if (!u || u.hash !== hashPassword(body.password || '', u.salt)) {
      return c.json({ ok: false, msg: isEmail ? '邮箱或密码错误' : '用户名或密码错误' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    await sql`INSERT INTO tokens(token,username,created_at) VALUES(${token},${account},${now})`;
    return c.json({ ok: true, token, username: account });
  } catch (e) { return c.json({ ok: false, msg: '服务器错误', err: String(e && e.message || e) }); }
});

app.get('/api/data', async (c) => {
  try {
    const sql = getSql(c.env);
    if (!sql) return c.json({ ok: false, msg: '数据库未配置' });
    const username = await authUser(c);
    if (!username) return c.json({ ok: false, msg: '未登录' }, 401);
    const rows = await sql`SELECT data, synced_at FROM userdata WHERE username=${username}`;
    if (!rows[0]) return c.json({ ok: true, username, data: {}, syncedAt: null });
    const d = rows[0].data || {};
    d.syncedAt = Number(rows[0].synced_at) || null;
    return c.json({ ok: true, username, data: d, syncedAt: d.syncedAt });
  } catch (e) { return c.json({ ok: false, msg: '服务器错误', err: String(e && e.message || e) }); }
});

app.put('/api/data', async (c) => {
  try {
    const sql = getSql(c.env);
    if (!sql) return c.json({ ok: false, msg: '数据库未配置' });
    const username = await authUser(c);
    if (!username) return c.json({ ok: false, msg: '未登录' }, 401);
    const body = await c.req.json();
    if (typeof body !== 'object') return c.json({ ok: false, msg: '数据格式错误' });
    const syncedAt = Date.now();
    const dataStr = JSON.stringify(body);
    await sql`INSERT INTO userdata(username,data,synced_at) VALUES(${username},${dataStr}::jsonb,${syncedAt})
              ON CONFLICT (username) DO UPDATE SET data=${dataStr}::jsonb, synced_at=${syncedAt}`;
    return c.json({ ok: true, syncedAt });
  } catch (e) { return c.json({ ok: false, msg: '服务器错误', err: String(e && e.message || e) }); }
});

// [debug] 链路诊断：对比 HTTPS(HTTP-mode) 与 WebSocket 两条通道到 Neon 的耗时
app.get('/api/_nettest', async (c) => {
  const out = { t: Date.now() };
  // 1) HTTPS POST /sql（neon HTTP mode 底层）
  {
    const t0 = Date.now();
    try {
      const url = new URL(c.env.DATABASE_URL.replace(/^postgres/, 'https'));
      const res = await fetch(url.origin + '/sql', {
        method: 'POST',
        headers: { 'Neon-Connection-String': c.env.DATABASE_URL },
        body: JSON.stringify({ query: 'SELECT 1 AS ok' }),
        signal: AbortSignal.timeout(8000)
      });
      out.https = { ms: Date.now() - t0, status: res.status, body: (await res.text()).slice(0, 120) };
    } catch (e) { out.https = { ms: Date.now() - t0, err: String(e && e.message || e).slice(0, 120) }; }
  }
  // 2) WebSocket (neon Client /v2)
  {
    const t0 = Date.now();
    try {
      const wsProbe = (async () => {
        const client = new Client({ connectionString: c.env.DATABASE_URL, wsConstructor: WebSocket });
        await client.connect();
        const r = await client.query('SELECT 1 AS ok');
        await client.end();
        return r.rows;
      })();
      out.ws = { ms: Date.now() - t0, rows: await Promise.race([
        wsProbe,
        sleep(8000).then(() => { throw new Error('ws handshake timeout'); })
      ]) };
    } catch (e) { out.ws = { ms: Date.now() - t0, err: String(e && e.message || e).slice(0, 120) }; }
  }
  return c.json(out);
});

app.get('/api/health', (c) => {
  // 异步 ping 数据库预热（不阻塞响应）：任何 health 探测都会顺带唤醒 Neon，减少冷启动
  const sql = getSql(c.env);
  if (sql && c.executionCtx && c.executionCtx.waitUntil) {
    c.executionCtx.waitUntil(sql`SELECT 1`.catch(() => {}));
  }
  return c.json({ ok: true, name: 'qinglian-backend', mode: c.env.DATABASE_URL ? 'postgres' : 'file', time: Date.now() });
});

// ---------- 静态资源：非 /api 路由交给 ASSETS ----------
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

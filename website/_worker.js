// 轻练健身 - Cloudflare Pages _worker.js（单文件 Functions）
// /api/* 交给 Hono 后端，其他路由返回静态资源（ASSETS）
// 开启 nodejs_compat 保留 crypto.scryptSync/randomBytes，旧用户密码零迁移
import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';
import crypto from 'node:crypto';

const app = new Hono();

let _sql = null;
function getSql(env) {
  if (!_sql && env.DATABASE_URL) _sql = neon(env.DATABASE_URL);
  return _sql;
}

async function ensureTables(sql) {
  await sql`CREATE TABLE IF NOT EXISTS users(username TEXT PRIMARY KEY, salt TEXT NOT NULL, hash TEXT NOT NULL, created_at BIGINT NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS tokens(token TEXT PRIMARY KEY, username TEXT NOT NULL, created_at BIGINT NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS userdata(username TEXT PRIMARY KEY, data JSONB NOT NULL, synced_at BIGINT NOT NULL)`;
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

app.post('/api/register', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body || {};
    if (!username || !password) return c.json({ ok: false, msg: '用户名和密码不能为空' });
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return c.json({ ok: false, msg: '用户名需为3-20位字母/数字/下划线' });
    if (String(password).length < 6) return c.json({ ok: false, msg: '密码至少6位' });
    const sql = getSql(c.env);
    if (!sql) return c.json({ ok: false, msg: '数据库未配置' });
    await ensureTables(sql);
    const exists = await sql`SELECT username FROM users WHERE username=${username}`;
    if (exists[0]) return c.json({ ok: false, msg: '用户名已存在' });
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const now = Date.now();
    await sql`INSERT INTO users(username,salt,hash,created_at) VALUES(${username},${salt},${hash},${now})`;
    const token = crypto.randomBytes(32).toString('hex');
    await sql`INSERT INTO tokens(token,username,created_at) VALUES(${token},${username},${now})`;
    return c.json({ ok: true, token, username });
  } catch (e) { return c.json({ ok: false, msg: '服务器错误', err: String(e && e.message || e) }); }
});

app.post('/api/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body || {};
    const sql = getSql(c.env);
    if (!sql) return c.json({ ok: false, msg: '数据库未配置' });
    await ensureTables(sql);
    const rows = await sql`SELECT salt, hash FROM users WHERE username=${username}`;
    const u = rows[0];
    if (!u || u.hash !== hashPassword(password || '', u.salt)) {
      return c.json({ ok: false, msg: '用户名或密码错误' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();
    await sql`INSERT INTO tokens(token,username,created_at) VALUES(${token},${username},${now})`;
    return c.json({ ok: true, token, username });
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

app.get('/api/health', (c) => c.json({ ok: true, name: 'qinglian-backend', mode: c.env.DATABASE_URL ? 'postgres' : 'file', time: Date.now() }));

// ---------- 静态资源：非 /api 路由交给 ASSETS ----------
app.all('*', (c) => c.env.ASSETS.fetch(c.req.raw));

export default app;

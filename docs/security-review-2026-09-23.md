# 轻练网站安全审查

- 审查日期：2026-09-23
- 审查版本：`master` @ [`a9edfd7`](https://github.com/realhenrylan/qinglian-fitness/commit/a9edfd76127f8036dba479617a646e5678612770)
- 审查范围：`website/` PWA、`backend/` API、Netlify Functions 与部署配置。
- 方法与限制：静态代码审查；没有对线上站点做渗透测试，也无法从仓库确认 Netlify 控制台环境变量、访问控制或运行时响应头。本文结论仅对应上述提交。

## 总体结论

后端对云端数据使用 Bearer token 校验，密码使用随机盐和 scrypt 哈希，SQL 查询使用参数绑定，JSON 请求体限制为 2 MB。静态检查没有发现匿名读取或修改用户云端数据的直接路径。

需要优先处理的是共享设备上的账号数据残留、Service Worker 缓存私有 API 响应，以及同步数据进入 HTML 的安全边界。令牌长期有效、认证接口没有限流、PostgreSQL TLS 证书验证被关闭，也会增加账户和服务风险。

## 发现

### 中高：退出登录后，本地个人数据仍会暴露给下一位登录用户

[退出逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L247-L250)只清除 `auth`，没有清除 `profile`、`records`、`dietEntries` 和 `waterMap`。这些数据保存在浏览器的 `localStorage`（[存储定义](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L157-L170)）。新账号登录后，只有本地训练记录和饮食记录都为空时才自动下载该账号的数据（[登录后的恢复逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L837-L845)）。

在共享浏览器上，下一位用户可能看到上一个用户的体重、饮食和训练记录；如果再点“上传到云端”，还可能把旧数据写入新账号。

**建议：**退出或切换账号时清除账号级本地数据；登录后始终加载当前账号数据，并以当前账号的数据替换状态，不要把不同账号的数据合并。若要支持离线使用，应按账号隔离本地数据。

### 中：Service Worker 会缓存包含个人数据的 API 响应

[Service Worker](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/sw.js#L17-L29)缓存所有同源且状态为 200 的 GET 响应，并在网络失败时返回缓存。它没有排除 `/api/` 路径，也没有在退出登录时清除相关缓存。[云端数据接口](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L158-L164)会返回完整用户数据。

这会让私有响应留在 Cache Storage；同一浏览器的账号切换或离线使用时，可能返回之前缓存的数据。服务端响应也没有在应用代码中明确设置禁止存储的缓存策略。

**建议：**让 Service Worker 对 `/api/*` 直接走网络，不写入 Cache Storage；API 响应设置 `Cache-Control: private, no-store`；退出或切换账号时清除旧的用户数据缓存。

### 中：云同步数据未经完整校验就进入 HTML，存在条件性存储型 XSS

后端 [`PUT /api/data`](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L167-L175)只检查请求体是否为对象，就保存其内容。前端 [`syncApply()`](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L197-L206)接受同步的档案和记录。页面使用 `innerHTML` 渲染时，部分同步字段没有转义，例如训练记录日期（[记录渲染](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L683-L689)）和身体档案的数值字段（[档案渲染](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L729-L741)）。因此，若恶意数据被写入一个账号，同一账号在其他设备打开相关页面时，数据可能被当作 HTML 执行。写入目标账号数据需要该账号的有效令牌或其他账号级访问权限，不能据此认定为匿名攻击。

**建议：**服务端按字段定义并校验同步数据结构、类型、长度和数值范围；前端将用户数据作为文本节点插入，或对每个 HTML 上下文正确编码。不要把未经验证的同步数据直接插入 `innerHTML`。

### 中：Bearer token 没有过期或服务端撤销机制

令牌表保存 `created_at`，但 [令牌读取逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L70-L90)没有检查过期时间；[认证逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L122-L127)只按令牌查找用户名。客户端退出登录仅清空浏览器里的令牌（[退出逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L247-L250)），没有让服务端令牌失效。前端还将令牌保存在 `localStorage`（[存储逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L157-L160)、[登录逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/website/app.js#L230-L245)）。

**建议：**实现服务端令牌到期和撤销；退出时撤销当前令牌，并清理过期记录。评估将会话改为安全属性配置完整的 HttpOnly Cookie；若继续使用 Bearer token，应缩短有效期并配合刷新与撤销机制。

### 中：公开登录和注册接口没有限流

[登录和注册路由](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L130-L156)没有 IP 或账号级速率限制。每次登录都会执行同步的 `scryptSync`（[哈希函数](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L118-L126)），持续请求可能占用事件循环；开放注册也可能被自动化脚本用于大量创建账号。

**建议：**对登录和注册设置速率限制、失败退避和异常流量监控；限制密码最大长度，并考虑使用异步密码哈希以避免阻塞事件循环。

### 中：PostgreSQL TLS 连接跳过证书验证

数据库连接配置为 `ssl: { rejectUnauthorized: false }`（[连接配置](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L9-L14)）。这会使客户端无法验证对端证书，削弱 TLS 对中间人攻击的防护。

**建议：**启用证书验证，并按数据库服务商要求配置可信 CA。

### 低：并发注册可能覆盖刚创建账号的密码

注册逻辑先查询用户名，再调用数据库写入；写入语句在用户名冲突时会更新现有用户的盐和密码哈希（[写入逻辑](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L57-L68)、[注册流程](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L130-L141)）。若两个同名注册请求并发通过前置查询，后执行者可能覆盖先执行者刚创建的密码。

**建议：**注册时使用原子插入，并在唯一键冲突时返回“用户名已存在”；不要在注册路径更新已有账号的密码哈希。

## 其他加固建议

- CORS 当前允许所有来源，并允许 `Authorization` 请求头（[CORS 配置](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L21-L29)）。建议限制到实际生产站点来源，并为本地开发单独配置。
- 仓库未定义 CSP、`X-Content-Type-Options`、`Referrer-Policy`、`frame-ancestors` 等响应头（参见 [Netlify 配置](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/netlify.toml)）。建议在 Netlify 响应头配置中添加；同时优先移除内联脚本，以便部署严格 CSP。
- 部署工作流每次运行时全局安装未固定版本的 Netlify CLI（[部署工作流](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/.github/workflows/deploy.yml#L21-L31)）。建议固定 CLI 版本，并使用锁文件安装，以降低供应链变更风险。
- 部署工作流没有提供 `DATABASE_URL`，而后端在该变量缺失时会使用 JSON 文件模式（[存储模式选择](https://github.com/realhenrylan/qinglian-fitness/blob/a9edfd76127f8036dba479617a646e5678612770/backend/app.js#L1-L14)）。请在 Netlify 环境中确认已配置数据库连接；Netlify Functions 的本地文件写入不应作为持久用户数据存储。

## 建议修复顺序

1. 修复退出和账号切换时的本地数据隔离。
2. 禁止 Service Worker 缓存认证后的 API 响应。
3. 对云同步数据做服务端结构校验，并修正所有 HTML 渲染点。
4. 加入令牌过期、撤销及认证接口限流。
5. 恢复 PostgreSQL TLS 证书验证。
6. 加固 CORS、响应头、注册冲突处理和部署依赖固定。

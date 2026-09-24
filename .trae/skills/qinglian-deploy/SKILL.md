---
name: qinglian-deploy
description: 轻练网站一键发布与公网校验。当 website/ 或 backend/netlify/functions/ 的代码改动需要上线时使用，自动完成提交、推送、等待 Actions 部署、公网版本与缓存头校验。不要用于首次建仓、数据库或 Netlify 配置变更。
---

# Qinglian Deploy

本技能把「改完代码 → 发布上线 → 公网验证」固化为一条可重复流程，避免每次手动拼 git 命令、等部署、查响应头。

## 何时使用

- 修改了 `website/`（index.html / app.js / style.css / sw.js / _headers / manifest 等）或 `backend/netlify/functions/api.js`，准备发布到 https://qinglian-fitness-wzy.netlify.app
- 用户说「上传」「发布」「部署」「推到线上」「更新到 GitHub」等

不要用于：新建仓库、改 Netlify 站点配置、换数据库、第一次配置 GitHub Actions 凭据。

## 发布步骤

### 1. 提交前自检

- 若改了 `app.js` 或 `sw.js`，先跑语法检查：
  ```powershell
  node --check website/app.js
  node --check website/sw.js
  ```
- 若本地后端在跑（`http://localhost:3000/api/health` 返回 ok），优先本地端到端测一遍再发。

### 2. 提交代码

单行提交信息（避免 PowerShell heredoc 引号转义问题）：

```powershell
git add -A
git commit -m "<type>: <简短描述，含版本号或要点>"
```

type 用 `feat` / `fix` / `refactor` / `chore` 之一。

### 3. 运行发布脚本

```powershell
.\.trae\skills\qinglian-deploy\scripts\deploy.ps1
```

脚本会依次完成：
1. 读取 `.auth/gh_token.txt` 作为 GH_TOKEN（已被 gitignore，不入仓库）
2. `git push origin master`
3. 轮询 GitHub Actions（最多 180 秒），直到本次 push 的 run 完成
4. 公网校验：`/api/health`、`app.js` 版本号、`sw.js` 缓存版本、`index.html` 的 `Cache-Control` 响应头
5. 输出最终状态：✅ 成功 / ❌ 失败（带原因）

### 4. 失败回滚

若脚本报告失败：
- 看 Actions 日志：`gh run view <id> --repo wzy3261489869/qinglian-fitness`
- 常见原因：Netlify token 过期、函数构建报错、代码语法错误
- 修复后重新提交并再次运行脚本

## 关键约定

- **不要**用多行 heredoc 写 commit message，PowerShell 5 会出问题。
- **不要**用 `Invoke-WebRequest` 抓公网 JS，压缩响应会触发 NullReferenceException；用 `curl.exe`。
- **不要**把 `.auth/` 提交进去，`.gitignore` 已排除。
- `git push` 输出走 stderr，必须加 `2>&1` 才能看到进度。
- 每次改 `index.html` 结构后，务必 bump `sw.js` 里的 `CACHE` 版本号（`qinglian-vN` → `qinglian-v(N+1)`），否则用户仍拿旧页面。

## 相关文件

- `.github/workflows/deploy.yml` — 自动部署工作流
- `website/_headers` — 缓存策略（HTML 不缓存）
- `.auth/gh_token.txt` — GitHub token（本地）

# 全站 UI/UX 精修 v1.8.0 实施计划

## Repository Research

当前站点（`website/`）为移动优先 PWA，纯原生 JS、无构建、经典 `<script>` + IIFE 命名空间、document 级事件委托、localStorage（`ql_` 前缀）。已有基础：

- **底部 tabbar**：5 项 首页/计划/饮食/数据/我的；`TABS=['home','plan','diet','stats','mine']`，`showTab()` 分发渲染
- **深色模式**：`theme=auto|light|dark`（app.js L246-259），我的页有切换器，index.html 有防闪烁脚本，CSS 变量覆盖较全
- **响应式**：断点 768 / 1024 / 1280；但 PC 宽屏下仍是居中窄单列（max 900px），未利用宽屏
- **空状态**：部分列表有 emoji 空态（stats 最近记录、计划筛选、动作库无结果、动作库加载中文案），样式不统一
- **登录门控**：错误提示 `#gateError`，后端登录失败返回"用户名或密码错误"、注册冲突返回"用户名已存在"；我的页内嵌 auth 表单无实时校验
- **动效**：仅 `prefers-reduced-motion` 兜底，无页面切换/数字动画
- 全局设施可复用：`store/$/$$/esc/toast/pad/todayStr/addDays/ring/streakDays/saveSettings/renderMine`；模块 `PlanModule`、`DietModule`、`RewardsModule`

## Files and Modules

- `website/index.html`：tabbar 改 4 项（图标+文案）
- `website/app.js`：路由收敛为 4 tab、记录页分段（训练/饮食）、空状态组件、数字 count-up、tab 进入动画、门控实时校验与错误文案映射、内嵌 auth 表单校验、首页主题快捷按钮、版本号 v1.8.0
- `website/style.css`：骨架屏 shimmer、统一空状态、全局按压反馈、tab 过渡、PC 宽屏多列布局（首页 dashboard / 计划网格 / 记录 dashboard / 我的两列）、字段错误态、深色硬编码颜色补齐
- `website/diet-module.js`：从记录页分段进入时的返回切换、添加食物子页骨架屏、空态复用统一组件
- `website/training-plans.js`：空态统一；PC 计划网格样式由 CSS 接管（仅必要的类名微调）
- `website/sw.js`：CACHE 升级 `qinglian-v13`

## Implementation Steps

1. **导航重构（4 tab）**
   - tabbar：首页 🏠 / 训练 🏋️ / 记录 📊 / 我的 👤；`data-tab` 沿用 `home/plan/stats/mine` 减少改动
   - `TABS=['home','plan','stats','mine']`；新增全局 `recordsView='train'|'diet'`
   - `showTab('stats')` 按 `recordsView` 渲染：train→`renderStats()`，diet→`DietModule.renderDiet()`
   - 记录页顶部加分段切换条（训练记录/饮食记录），切换时改 `recordsView` 并重渲染
   - 首页"饮食记录"快捷入口：设置 `recordsView='diet'` 后跳 stats；"数据统计"入口设为 train
2. **骨架屏**
   - 动作库：初始 `#libGrid` 改为 8 个 shimmer 骨架卡（CSS `.skeleton` + shimmer 动画），数据到达后替换
   - 添加食物子页：foods 未加载时列表区显示骨架行
   - App 启动 token 校验期间：轻量启动骨架（#app 内 3 行骨架），门控/首页渲染后自然替换
3. **统一空状态组件**
   - app.js 提供 `emptyHTML(type, title, sub)`：线条风内联 SVG 插画（记录本/搜索/计划三种）+ 标题 + 副文案，可选 CTA
   - 替换：stats 最近记录空态、计划筛选空态、动作库无结果/加载失败、饮食页相关空态
4. **按压反馈（纯 CSS）**
   - 全局交互元素 `:active` 统一 `transform: scale(.97)` + 轻微变暗：`.btn,.chip,.q,.tp-card,.tt-start,.seg-i,.water-cups span,.dmd-btn,.lib-card,.meal .plus`
5. **表单实时校验 + 明确错误文案**
   - 门控：用户名/密码 input 实时校验（失焦与输入时），字段下内联提示 + 错误边框；登录失败密码框聚焦选中（已有）保留
   - 错误文案映射：
     - 登录"用户名或密码错误" → **"用户名或密码不正确，请重新输入；若忘记密码，可用同一用户名重新注册"**
     - 注册"用户名已存在" → **"这个用户名已被注册，换一个试试，或直接去登录"**
   - 我的页内嵌 auth 表单：同样实时校验提示，提交逻辑复用 `doAuth`
6. **深色模式收尾**
   - 巡检替换硬编码颜色（内嵌 auth 输入框 `#ddd` 等）为 CSS 变量；首页页头加主题快捷切换小按钮（auto 下在浅/深色间快速切）
7. **PC 宽屏布局（移动风格保留）**
   - 1024+：首页 dashboard 两列网格（主列：hero/今日训练/热门计划；侧列：统计四格/快捷入口/鼓励卡）
   - 训练页：`.tp-list` 双列卡片网格；今日卡保持全宽
   - 记录页：统计格 auto-fit、streak/海报/图表/日历/热力图卡片两列流式排布
   - 我的页：左列个人/身体数据/趋势，右列目标/主题/偏好/账号/成就
   - tabbar 在 PC 仍底部居中、宽度跟随容器，略微增高保持移动端观感
8. **动效**
   - tab 切换：`#app` 内容 fade-up 进入（切换时重启动画，subpage 不动）
   - 数字 count-up：`data-count` 属性标记 + 渲染后 rAF easeOut 约 700ms（首页/记录页/饮食页千卡与天数）；`prefers-reduced-motion` 时直接显示终值

## Dependencies and Considerations

- `renderDiet()` 内部维护 `viewDate`，从分段条进入时不重置日期；分段切换"训练记录"需保留滚动位置到顶部
- 云同步 `syncCollect/syncApply` 已含 theme/settings，recordsView 为本地 UI 态不入云
- 子页（workout/lib/tp-detail/dm-add）已有独立过渡与 1024 适配，本轮避免回归
- SW 网络优先策略，bump CACHE 后旧缓存自动清理
- 减少动效偏好：所有新增动画均需受现有 reduced-motion 兜底覆盖

## Validation

- `node --check`：app.js / diet-module.js / training-plans.js / sw.js
- localhost:3000（测试账号 ql_t_0623）端到端：
  - 4 tab 切换、active 态；记录页分段 训练↔饮食 双向正常
  - 动作库骨架屏 → 内容；添加食物骨架
  - 清空记录后空状态插画显示；注入数据后恢复
  - 错误密码登录：明确文案展示、密码框选中；注册冲突文案
  - 深色/浅色/跟随系统三态切换无闪烁、无漏网硬编码色
  - 375px / 768px / 1280px 三视口截图核对布局
  - tab 进入动画与数字 count-up 肉眼确认；reduced-motion 下退化为直接显示
- deploy.ps1 发布；公网校验 v1.8.0、qinglian-v13、各模块 200

## Risks

- **PC 多列布局回归移动端**：所有多列规则限定在 1024+ 断点内，移动默认流式不动
- **双源 DOM 覆盖导致闪烁**（历史教训）：tabbar 仅在 index.html 单点定义，JS 只切 class，不重写结构
- **测试污染真实数据**：仅用测试账号与临时数据，结束后恢复；不新增测试种子文件提交
- **count-up 频繁重渲染抖动**：仅在整页渲染时启动一次，计时器类数字（训练计时）不接入

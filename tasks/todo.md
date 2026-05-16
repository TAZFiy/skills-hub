# 2026-05-14 页面设计优化

## Spec

- 目标：优化 Skills Hub 的主工作区视觉与操作体验，让技能管理页更像高效的本地运维控制台，而不是普通数据表。
- 范围：首页技能管理页、全局壳层、导航、列表工具条、状态展示、详情抽屉、响应式样式，以及必要的设计文档与验证记录。
- 非目标：不改变同步、删除、标记自制、规则编辑等业务行为；不新增后端数据结构；不引入大型 UI 框架。
- 设计方向：采用安静、清晰、偏工具型的“本地控制台”风格。保留高信息密度，但把状态、筛选、批量操作和行内操作做出更明确的层级。
- 参考原则：
  - 首屏优先显示关键指标与待处理状态。
  - 搜索、筛选、批量操作常驻，不藏在弹窗里。
  - 行内操作靠近资源本身，减少来回跳转。
  - 移动端避免不可控横向表格，必要时转为卡片式资源列表。
  - 颜色服务状态语义，不做单一色系装饰。

## Tasks

- [x] 审查当前页面、组件、样式与既有设计文档
- [x] 联网调研类似 SaaS/admin dashboard 的近期最佳实践
- [x] 与用户确认优化方案
- [x] 写入设计文档 `docs/plans/2026-05-14-page-design-optimization-design.md`
- [x] 制定实现计划并挑战是否有更优雅方案
- [x] 优化全局壳层、导航和页面标题区
- [x] 优化技能列表工具条、状态层级、行内操作与详情抽屉
- [x] 优化移动端布局与可点击区域
- [x] 运行类型检查、测试和浏览器视觉验证
- [x] 在本文档补充 Review / 复盘
- [x] 更新 `tasks/lessons.md`

## Verify

- 首页打开后 5 秒内能看清总量、待同步、异常、外部项和可执行主操作。
- 搜索、筛选、批量同步、单项同步、标记自制、删除和详情入口仍可用。
- 详情抽屉保持补充信息查看职责，不抢占列表主流程。
- 移动端关键操作不丢失，文本不重叠，不依赖用户猜测横向滚动。
- TypeScript 和现有测试通过。
- 使用浏览器截图检查桌面与移动端主要页面。

## Review

- 结果：全局壳层改成更明确的本地控制台表达，顶部显示 `Local console`，左侧导航 active/hover 层级更清楚。
- 结果：首页新增状态概览区，直接展示全部技能、待同步、异常和自制条目；搜索、筛选、选择和同步操作被整理成常驻控制条。
- 结果：技能矩阵保留桌面高密度表格，同时强化 sticky 表头、行 hover、选中态、状态 pill 和行内操作按钮。
- 结果：窄屏下技能表格会转为卡片式行布局，关键状态与操作不再只能依赖横向滚动。
- 结果：详情抽屉更像 inspector，代码区高度更实用，并支持 Escape 关闭。
- 结果：移除 `next/font/google` 依赖，改用本地/系统字体栈，避免本地构建因无法访问 Google Fonts 失败。
- 通过：`npx tsc --noEmit`
- 通过：`npm test`
- 通过：`npm run build`
- 通过：`curl --noproxy '*' -s http://127.0.0.1:3015` 返回真实 Next 页面 HTML，确认本地渲染入口正常。
- 通过：`git diff --check`
- 未完成：当前工具列表没有可用的浏览器截图工具，未能产出桌面/移动截图；已用类型、测试、生产构建和本地页面请求覆盖主要风险。

## Follow-up: 视觉返工

- [x] 降低卡片套卡片、重阴影和粗边框带来的笨重感
- [x] 将左侧导航从大块深色按钮改为更轻的工具 rail
- [x] 将状态概览从四张大卡改成紧凑指标条
- [x] 压缩表格按钮和行高，让资源列表更像专业工作台
- [x] 重新运行类型检查、测试和构建

### Follow-up Review

- 结果：移除主控制区的大卡片容器，让页面从“卡片堆叠”回到更轻的工具台布局。
- 结果：左侧 active 导航不再使用大块深色底，改为白底轻边框，视觉负担更小。
- 结果：状态概览高度、间距和图标块都压缩，减少首屏臃肿感。
- 结果：表格按钮、行高、标题字号和描述字号进一步收紧，资源列表更密、更像工作台。
- 通过：`npm test`
- 通过：`npm run build`
- 通过：`npx tsc --noEmit`
- 通过：`git diff --check`

# 2026-05-15 Skill 安装功能

## Spec

- 目标：在 Skills Hub 中增加安装入口，用户输入 GitHub skill 项目地址或本地目录后，将其中的 skill 安装到所有 enabled coding agent 的 skills 目录。
- 范围：安装器核心逻辑、安装 API、首页表单入口、结果反馈、单元测试、文档和验证记录。
- 非目标：不做覆盖安装、不做版本管理、不改变现有同步/删除/标记自制语义。
- 安装策略：
  - 根目录有 `SKILL.md` 时按单个 skill 安装。
  - 子目录有 `SKILL.md` 时按多个 skill 安装。
  - 目标目录已存在时跳过并报告冲突。
  - 安装目标来自 `config/agents.json` 中 enabled agent 的 `skillsPath`。

## Tasks

- [x] 审查现有 skill 扫描、同步、页面和 agent 配置结构
- [x] 与用户确认安装设计
- [x] 写入设计文档 `docs/plans/2026-05-15-skill-installer-design.md`
- [x] 写入实现计划 `docs/plans/2026-05-15-skill-installer-implementation.md`
- [x] 实现安装器核心逻辑
- [x] 新增安装 API
- [x] 在首页 Skills Board 增加安装表单和结果反馈
- [x] 增加安装器单元测试
- [x] 运行测试、类型检查、构建和 diff 检查
- [x] 在本文档补充 Review / 复盘
- [x] 更新 `tasks/lessons.md`

## Verify

- 本地目录根部 `SKILL.md` 可安装到所有 enabled agent。
- 多 skill 目录可一次识别并安装多个 skill。
- 已存在目标目录不会被覆盖。
- 无效目录或无 skill 输入返回清晰错误。
- GitHub URL 通过 clone 后按同一套发现逻辑安装。
- 首页安装后刷新列表，并展示安装/跳过/失败结果。

## Review

- 结果：新增 `installSkillSource` server library，集中处理输入分类、GitHub clone、本地目录读取、skill 发现、复制安装、冲突跳过和临时目录清理。
- 结果：新增 `POST /api/skills/install`，前端只提交 `{ source }`，目标 agent 目录仍来自 `config/agents.json` 的 enabled agents。
- 结果：首页 Skills Board 新增安装栏，支持输入 GitHub skill 地址或本地目录，安装后展示发现的 skill 名称，以及已安装/跳过/失败数量，并刷新现有列表。
- 结果：GitHub 根目录 skill 会使用仓库名作为安装目录名；本地根目录 skill 使用本地目录名。
- 结果：目标目录已存在时跳过，不覆盖现有内容。
- 通过：`npm test -- src/lib/skills/install-skill-source.test.ts`
- 通过：`npm test`
- 通过：`npx tsc --noEmit`
- 通过：`npm run build`
- 通过：`git diff --check`
- 通过：`curl --noproxy '*' -s -I http://127.0.0.1:3016` 返回 `HTTP/1.1 200 OK`
- 说明：曾在 dev server 运行时执行 `next build`，导致 Next dev manifest 临时 500；重启 dev server 后恢复 200，生产构建始终通过。

## Follow-up: GitHub clone 代理失败

- [x] 定位 `CONNECT tunnel failed, response 501` 来自 `git clone` 继承代理环境
- [x] 增加代理隧道失败后的无代理重试
- [x] 增加 HTTP/2 framing 失败后的 HTTP/1.1 重试
- [x] 增加 git clone 超时，避免网络挂起导致安装按钮一直等待
- [x] 增加 git clone 环境构造测试
- [x] 重新运行安装器测试、完整测试、类型检查和构建
- [x] 更新复盘记录

### Follow-up Review

- 结果：`git clone` 仍先使用默认环境，兼容需要代理的正常场景。
- 结果：当 clone 报 `CONNECT tunnel failed` / `response 501` / proxy 类错误时，自动清理 `HTTP_PROXY`、`HTTPS_PROXY`、`ALL_PROXY` 等变量后重试。
- 结果：当 clone 报 HTTP/2 framing 类错误时，自动使用 `git -c http.version=HTTP/1.1 clone ...` 重试。
- 结果：clone 增加 180 秒超时，避免当前网络链路长时间挂起时 UI 无限等待。
- 通过：`npm test -- src/lib/skills/install-skill-source.test.ts`
- 通过：`npm test`
- 通过：`npx tsc --noEmit`
- 通过：`npm run build`
- 通过：`git diff --check`
- 说明：对 `https://github.com/pbakaus/impeccable/` 的临时真实 clone 已经越过原始 501 和 HTTP/2 framing 报错，但当前网络传输长时间未完成；因此保留代码级重试并加入超时保护。

## Follow-up: 重复 skill key

- [x] 定位 React key warning 来自扫描层把多个目录的 `frontmatter.name` 都映射成 `impeccable`
- [x] 将 skill identity 固定为目录名，避免同步状态和 UI key 被 frontmatter 撞名影响
- [x] 增加扫描层重复 frontmatter name 的回归测试
- [x] 重新运行测试、类型检查和构建
- [x] 更新复盘记录

### Follow-up Review

- 结果：`scanAllSkills` 和 `scanSourceSkills` 现在都使用目录名作为 skill identity，不再用 `SKILL.md` frontmatter 的 `name` 覆盖目录名。
- 结果：Skills Board 的表格行 key 改为 `sourcePath:name`，即使扫描数据异常也更不容易触发 React 重复 key warning。
- 结果：新增 `scan-all-skills.test.ts`，覆盖多个目录拥有同一个 frontmatter `name` 的场景。
- 结果：补强 `scan-source-skills.test.ts`，保证 source scanner 也遵守同一身份规则。
- 通过：`npm test -- src/lib/skills/scan-all-skills.test.ts src/lib/skills/scan-source-skills.test.ts`
- 通过：`npm test`
- 通过：`npx tsc --noEmit`
- 通过：`npm run build`
- 通过：`git diff --check`

## 2026-05-14 专业 UI/UX 改版

### Spec

- 目标：按专业开发者工具的审美重塑项目视觉，形成统一、克制、精密的 Calm Developer Console 设计语言。
- 范围：首页 Skills 工作台、规则编辑器的共享视觉语言、全局 token、按钮/状态/表格/工具栏样式。
- 非目标：不改变后端同步语义，不新增页面，不引入重型组件库。
- 原则：
  - 表格是核心，指标和操作栏只为表格服务。
  - 高频操作显性，危险/低频操作收敛到 inspector。
  - 状态色只表达语义，不做装饰。
  - 少卡片、少阴影、少大块背景，靠间距、边框和排版建立层级。

### Tasks

- [x] 将首页顶部指标改为紧凑状态 strip
- [x] 简化表格行内操作，只保留同步和详情
- [x] 将标记自制和删除移入详情 inspector
- [x] 统一规则编辑器与首页的按钮、边框、状态语言
- [x] 收紧全局设计 token 和页面版式
- [x] 运行类型检查、测试、构建与 diff 检查
- [x] 记录复盘

### Review

- 结果：首页从指标卡堆叠改为紧凑状态 strip，视觉层级更靠近专业 data console。
- 结果：技能表格行内只保留同步和详情，标记自制与删除移动到详情 inspector，降低行内噪音。
- 结果：规则编辑器退出“深色孤岛”状态，顶部栏、按钮、状态提示与首页统一；代码编辑区保留深色以服务阅读和编辑。
- 结果：全局 token 进一步收紧，减少圆角、阴影、灰色背景层级和装饰性边框。
- 通过：`npm test`
- 通过：`npm run build`
- 通过：`npx tsc --noEmit`
- 通过：`git diff --check`

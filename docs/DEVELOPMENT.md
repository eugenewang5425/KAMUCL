# 开发与验证

本文适用于当前 Windows x64、Mac ARM64 共同代码基线。其他平台工程仍在仓库中，不代表本批交付或已经通过原生验收。

## 环境与命令

Node.js 24、Git、完整 JDK 17+ 是基础要求。`jar` 必须与 `javac` 一起位于 PATH：只安装 Windows 的 Java 启动别名会导致离线皮肤辅助程序构建失败。Windows 原生辅助程序需要 .NET SDK；Mac 构建需要 Xcode Command Line Tools、原生 ARM64 环境和 macOS 13+。

```sh
npm ci
node scripts/build-bridge.cjs
npm run dev
npx tsc --noEmit
npm test
npm run build
npm run license:check
```

`build` 包括主进程、预加载、渲染器以及原生和离线皮肤辅助程序。单独 Vite 渲染器构建只能证明界面编译成功，不替代完整生产构建。不要手动升级或降级本批锁定的 Electron 44.3.0 来掩盖平台问题。

Windows：`npm run dist:win` 生成便携 EXE 及 ZIP。Mac ARM64：在 Apple Silicon 上执行 `node scripts/pack-mac.mjs arm64 --package-only`，生成 APP、ZIP 和 DMG，然后执行对应原生启动及功能验收。跨平台压缩一个目录不能代替对应架构的原生构建。

## 模块边界

- `src/renderer/src/views` 负责页面组合；独立组件与 composable 承担确认、队列、草稿和画布交互。页面退出可以卸载展示，但后台任务生命周期由应用级注册表保持。
- `src/renderer/src/api.ts`、`src/preload`、`src/shared/types.ts` 定义受控 IPC 合同，前端不直接导入主进程服务。
- `src/main/ipc.ts` 注册业务入口；外观资产入口独立在 `assetsSettings.ts`，资产事务在 `core/appearanceAssetActions.ts`。失败时先保留旧设置和图片，不先删除再保存。
- `src/main/core` 的下载、安装事务、存档、Java、账号、联机、更新和文件验证分别维护自己的契约；`src/shared` 只放共享类型与纯策略。
- 更新来源探测在 `updateSources.ts`，正式下载适配在 `updateDownload.ts`，共用原有下载引擎；测速流不能当作已完成附件，也不能改变官方哈希信任来源。

运行 `node scripts/audit-module-boundaries.cjs BASE_COMMIT out/module-audit.json` 对比静态导入图。它区分类型边和运行时边、列出循环及越层依赖；不等价于完整调用图或功能验收。公共核心服务的既有调用关系不能为了报告好看随意拆断。

个性化配置的 `data-ui` 标识及完整父路径属于持久化兼容合同。提取 Vue 组件时须固定旧标识、保留父层结构，并用真实旧配置验证；新的文件名自动生成标识可能使旧自定义失效。

## 验证要求

新增测试须登记 `tests/all.test.ts`。先执行相关单元与事务测试，再执行完整测试、类型检查、生产构建和许可证检查。测试使用独立临时配置与实例，只控制所属测试进程；禁止按 `electron.exe` 或 Java 名称杀死所有进程。

界面须在最终生产渲染器上使用真实坐标操作，记录实际视口、系统 DPI、缩放、主题、截图与失败。IPC 夹具、真实网络读取、本地 HTTP 回放、实际落盘和真实游戏启动必须分别标注。软件 GPU 或云端原生桌面不能冒充真实用户图形硬件；没有设备或原文件的项目保留“未覆盖”。

本批专项入口：`tests/community-121.test.ts`、`tests/appearance-assets-actions.test.ts`、`tests/update-mirrors121.test.ts`、`tests/compatibility-121.test.ts`；外观隔离界面入口 `scripts/verify-appearance-121-ui.cjs`。513 MiB 嵌套包回归会流式生成约 1 GiB 临时磁盘数据，退出后清理自己的目录，原始用户包不参与公开测试。

## 发布与数据保护

每批更新 package.json、package-lock.json 根版本及 `src/shared/updateNotes.ts`，日志日期采用香港本地 `YYYY-MM-DD HH:mm`。master 与 main 保留独立历史，通过 cherry-pick 同步意图明确的提交；main 的已有文档差异需人工合并保留。不操作 wuhui，不强推。

成品须干净解压、启动、核对 ASAR 版本和附件 SHA256，源码须使用已提交的 Git 原始 blob。排除用户账号、配置、私钥、整合包、存档及无关文件；构建缓存和运行证据不直接整目录放入源码。标签显式绑定最终 master 提交；Release 发布后核对公开状态、标签、提交和全部附件的大小与哈希。

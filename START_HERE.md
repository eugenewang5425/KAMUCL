# START HERE — KAMUCL 1.1.20

本批改进社区中文 MOD 检索、版本筛选与返回保留，修复旧 Forge 导入及下载等待边界。Windows x64 已验证；Mac ARM64 原生构建完成，本批修改范围已复验，整个平台验收未全部通过。Electron 保持 44.3.0，资源占用优化继续暂停。最终平台放行状态、提交及成品哈希由 DELIVERY-1.1.20.json 绑定。

- Project: KAMUCL
- Deliverable: 1.1.20 Windows x64、Mac ARM64、源码及交接包；已测范围和失败分别列明
- Packaged artifact: _handoff/artifacts/ 内的本版成品；最终清单与 SHA 由 DELIVERY 绑定
- Intended receiver: 使用自己账号与游戏目录的玩家、维护者
- Operating system: Windows 10/11 x64、macOS 13+ ARM64；本批实际 Windows 11 和 macOS 26 原生云桌面
- Runtime/tool versions: Electron 44.3.0、Node.js 24、锁定 npm 依赖、JDK 17+；Windows 构建 JDK 25.0.2

## Prerequisites

Windows 成品不需要 Node.js，适用 Windows 10/11 x64。Mac 最低系统为 macOS 13，ARM64 原生构建；不能用最低系统要求代替实际验收。游戏需要自己的账号、适配 Java 和游戏资源。Windows 未发行者签名；Mac 仅 ad-hoc 签名，未 Developer ID 签名或公证。

开发需要 Node.js 24、锁定 npm 依赖、JDK 17+。Windows 构建还需 .NET Framework C# 编译器，本批使用 JDK 25.0.2；Mac 构建在原生 ARM64 runner 完成。

## Setup

核对 SHA256SUMS.txt。Windows 直接运行 KAMUCL-1.1.20.exe，或解压紧凑 ZIP 后运行同名 EXE；展开 ZIP 运行 KAMUCL.exe。Mac 使用本版 ARM64 ZIP 或 DMG；最低 macOS 13，未 Developer ID/公证。使用自己的配置和游戏目录。

源码解压后在项目根执行 npm ci、node scripts/build-bridge.cjs；交接包在 source 目录执行。源码与成品的提交差异在交付文档逐项列明，QA 和文档修改不冒充产品重建。

## Use the deliverable

社区首次默认搜索全部 Minecraft 版本及加载器。需要限定时选择“已安装版本”或“自定义版本”；加载器单独选择，匹配不一致时明确提示并提供应用实例加载器的操作。筛选不会替换首页启动实例，下载目标单独选择。返回社区保留关键词、版本、加载器、结果及浏览位置。

中文检索使用 MC百科公开标题及其明确关联的来源项目，不用英语首个近似结果替换项目身份。多项目检索、分页、部分来源失败和重试分别处理，失败不缓存成没有结果。

两个原始用户包在 Windows 成品完成真实导入，旧 Forge 1.7.10 使用适用的安装路径。下载显示实际文件、限流等待和备用来源，暂停不计为活动下载超时，仍校验哈希、路径及事务；原 ZIP 和旧实例保留。

## Verify

开发检查：npm test、npx --no-install tsc --noEmit、npm run license:check、npm run build。Windows 包：node scripts/verify-windows-package.cjs。详细范围、原始证据、独立评分及 Mac 实际结果见 docs/validation-1.1.20/README.md。

交接记录的验证命令数组是 ["node","source/scripts/check-licenses.cjs"]，在交接根运行应输出 License check passed 并退出 0；这只验证许可，不代替界面、真实服务、整合包或游戏验收。

Windows 最新全量 1,485 项：1,484 通过、0 失败、1 平台限定跳过。四主题最小窗口及常用缩放的社区和下载状态独立评分各项超过 8.5。原包完整落盘已逐文件审计；旧包 Java 8 仅记录所属进程和首次窗口烟雾检查，白色初始化截图不算主菜单、世界或正常退出通过。

源码使用最终 Git 原始 blob，不含用户 ZIP、世界、凭据、私钥、实时运行目录或未提交 pelican-bicycle.html。证据保留原截图和采集时间，不插帧、不把低帧率改为合格；部分像素保留合成测试目录主机标签。人工听感、完整动效、全部系统/DPI/加载器和实体 Mac 覆盖单列，不推断通过。

Mac APP 四主题修改模块通过；DMG 三主题通过，黑主题启动门槛失败且模块未执行。实际显示模式恢复、原 Cmd keyUp 接收断言和 1.20.1 OpenGL 用例仍失败，详见 MAC_ACCEPTANCE.json。专项通过不等于完整 Mac 一致性通过。

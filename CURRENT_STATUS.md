# CURRENT STATUS — KAMUCL 1.1.20

香港产品更新日志：2026-10-08 03:00。本批 Windows x64 和 Mac ARM64，Electron 44.3.0。保留用户图片、收藏、设置、历史计数、旧实例和未提交文件；不操作 wuhui，不强推，资源优化暂停。

## Identity

- Project: KAMUCL
- Version or revision: 1.1.20；最终 master 提交由标签和 DELIVERY 精确绑定
- Status timestamp: 2026-10-08 04:56 Asia/Hong_Kong

## Last verified state

Windows 产品来源 6af4611d819f652b14bd37e6b67b4f32a761fc28，517 项生产输入逐项与冻结字节、Git 内容及出包后文件核对。输入清单读取在构建期间结束，不能宣称先完全读取清单再启动构建；构建期间生产输入未变。生成 Java 组件另外核对实际出包字节。后续 Mac QA、测试与交付文档差异由最终 DELIVERY 绑定。

Windows `ad279ae2` 全量 1,485 项：1,484 通过、0 失败、1 Linux 专属跳过；Mac 成品来源 `0649ed5c` 原生全量 1,472 通过、0 失败、5 平台限定跳过。之后新增的 8 项编辑合同与 Mac 21 项专项另外记录，不拼成虚构的同源全量摘要。类型、许可、Windows 构建、便携包启动、ZIP 全部成员及干净解压通过。Mac 原生构建完成；实际专项分列，不授完整一致性通过。

- Build command: npm run build；electron-builder --win portable --x64 --config.electronDist=node_modules/electron/dist --publish never；node scripts/pack-windows-zip.cjs；原生 Mac node scripts/pack-mac.mjs arm64 --package-only
- Build result: 两平台生产构建完成；Windows 冻结输入和实际成品相符；Mac 实际专项与包完整性分列
- Test/validation commands: npm test；npx --no-install tsc --noEmit；npm run license:check；node scripts/verify-windows-package.cjs；当前源原生 Mac 工作流及所属界面专项
- Validation results: Windows ad279ae2 1484/1485、0 fail/1 平台 skip；Mac 0649ed5c 原生 1472/1477、0 fail/5 平台 skip；之后 21 项编辑/绑定合同与实际 APP/DMG 专项另列
- Finished artifact: Windows EXE、紧凑 ZIP、展开 ZIP；Mac ZIP/DMG 已生成并完成本批修改专项；整体失败与未覆盖单列
- Artifact SHA256: 已验证 Windows/Mac 如下表；源码和交接 由外部 DELIVERY 与 SHA256SUMS 绑定

## Last verified artifacts

| 文件 | 字节 | SHA256 |
| --- | ---: | --- |
| KAMUCL-1.1.20.exe | 97328652 | d2fad1f339c109c306d6a0740e1576b9e7cfd4e1090c63cac926758ecfe2648a |
| KAMUCL-1.1.20-windows-x64.zip | 97360651 | c17363d30cee39e3f83e6febcdb8385cc99bd5deb5563789cfeb5146e232149e |
| KAMUCL-1.1.20-windows-x64-unpacked.zip | 142997617 | c14a097dba78303ce5f87305d94756ae67e3fed74de5261608989fc03d252cd9 |
| KAMUCL-1.1.20-mac-arm64.zip | 125935198 | 0b06dd56486a6b0dbe76313a1e2124a4848efa919352f7efd7e3e69805ff4ebe |
| KAMUCL-1.1.20-mac-arm64.dmg | 135777035 | 8c4ea12185ac0139e572bba7e9fcff9cd2782489865275f79b739c7b7449a7d1 |

源码、交接及 Mac 成品由最终外部 DELIVERY 与 SHA256SUMS 精确绑定，避免自引用。

## Completed

- 社区首次默认全部版本；全部、现有实例、自定义精确版本和加载器明确选择。修复手选加载器被覆盖、迟到响应、来源分页和警告丢失。返回保留搜索与结果，下载目标使用精确目录和身份。
- 中文检索补齐 MC百科公开名称和明确项目关联，不以近似英文首条代替身份。查询失败不缓存为无结果，筛选和合并分页保留真实状态。
- 下载活动预算、暂停、系统 PAC 晚到、限流及备用来源边界修复，显示当前文件和原因。
- 旧 Forge 1.7.10 安装使用元数据、内嵌本体及受校验官方资源；修复 native classifiers 被伪造为普通 JAR 的启动前阻断。路径、哈希、取消、提交和回滚守卫保留。
- 原用户包在最终 Windows 成品完成真实网络导入。独立核对 4,249 资源对象、313 Modrinth 客户端文件、9,499 适用覆盖文件及 68 CurseForge 清单资源；后者为 67 JAR 和 1 材质包 ZIP。
- 最终 Windows 社区评分：合理性 9.2、功能性 9.1、外观 8.8；下载状态界面 9.1、9.0、8.7，各项单独超过 8.5。
- 独立 Mac 复评：APP 四主题、DMG 已执行三主题社区 9.2/9.1/8.8，下载状态 9.1/9.0/8.7；观察范围内无新关键产品缺陷。未执行的 DMG 黑主题不评分，整轮 Mac 不放行。

## Known issues and risks

两原包均无本轮世界验收通过。旧包 Java 8 实际创建正确架构进程及 LWJGL 窗口，原图仍白色；正常停止超时后仅对校验 PID、出生时间、父进程的所属 JVM 强制清理。不将 helper complete=true 当作菜单、画面、世界或正常退出通过。

一次游戏冒烟改写旧包测试目录 11 个配置/语言文件；导入时哈希与运行后变化分开保留。最终独立导入审计使用未运行游戏的新目录。33 个未标 UTF-8 文件名按既有 CP437 解码，不作 GBK 猜测，不宣称中文路径逐字正确。

Mac 历史 1.20.1 原图为 GLFW 65545 / NSGL 无合适像素格式，AXTrusted=true、AXWindows=-25204。现代 26.2 原生世界通过不能替代 OpenGL 链；尚无实体 Mac、macOS 13、Developer ID 或公证覆盖。新 APP/DMG 原始失败与测试修正分开保留，不以同源或 Windows 通过推断 Mac 一致。

204 PNG 与 800 JPEG 逐文件 SHA、大小及解码核对，未修图、裁剪、插帧或重判低帧率。部分像素包含合成目录主机标签，不冒称人工审核全部 1,004 图。人工听感、完整动效、全部 DPI/输入设备和加载器组合未覆盖。

## Remaining

Mac 完整平台一致性仍未达成：APP 四主题修改模块通过；DMG 三主题通过，黑主题门槛失败且模块未执行；显示模式恢复、原 Cmd keyUp 接收和 1.20.1 OpenGL 用例未通过。实体 Mac/macOS 13、完整帧率及听感仍需新增证据。公开附件、标签、两分支与匿名下载在发布最后核对，不提前记为成功。

## Historical failures

完整历史见 docs/validation-1.1.20/HISTORICAL_FAILURES.md。旧候选和原失败保留：下载末尾停留、官方限流、旧 Forge 不支持 CLI、native-only 伪造普通 JAR、Mac 临时目录别名、浮点坐标、缺少 Cmd keyUp、更新测试无条件依赖和新测试 receipt 重名。不同失败不合并为未验证的单一根因。

## Recommended next action

接收者核对 SHA256 后使用自己账号和目录。维护者用交接记录的许可命令验证干净解压副本，再按验证目录核对实际范围；最终提交及 QA/文档差异以 DELIVERY 为准。实机、世界、听感及完整动效需要新增证据。

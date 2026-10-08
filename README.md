# KAMUCL

KAMUCL 是基于 Electron 44.3.0、Vue 和 Three.js 的 Minecraft 启动器。当前交付 Windows x64 和 macOS ARM64，提供账号与离线皮肤、游戏和整合包安装、资源管理、社区收藏、实例分类、服务器、联机和个性化界面。

## 下载与启动

请从 [GitHub Releases](https://github.com/kamubaba-i/KAMUCL/releases) 下载对应平台的成品，并使用该版本的 `SHA256SUMS.txt` 核对文件。源码包不是可直接双击的应用。

- **Windows x64**：运行便携 EXE；或解压便携 ZIP 后运行其中的 EXE。复制可执行文件不会自动复制位于用户配置目录中的账号、图片、收藏和游戏数据。若分享整个文件夹，请先检查其中是否另行放入了用户数据。
- **Mac ARM64**：要求 macOS 13 或更新版本及 Apple Silicon。打开 ARM64 DMG，把 `KAMUCL.app` 拖入“应用程序”，推出镜像后运行；或解压 ARM64 ZIP，把应用移入“应用程序”再运行。不要选择 Intel 包，也不要在只读 DMG 内执行更新。当前包使用 ad-hoc 签名，未做 Apple Developer ID 签名与公证；如系统要求确认，请在“系统设置 → 隐私与安全性”按系统提示处理，不需要关闭整个系统的安全检查。

账号、设置、图片和收藏由当前系统的用户配置目录管理；游戏保存到设置中选定的游戏目录。安装到另一个磁盘时，请在“设置 → 游戏 → 游戏文件夹”添加并设置默认目录，安装确认页核对实际目标。离线账号不会获得正版在线服务器的验证权限。

每个版本的真实验证范围、平台差异及尚未覆盖项目在 Release 和交付文档中独立说明，不能把构建成功等同于所有第三方模组、游戏版本和图形设备都兼容。

## 从源码开发

安装 Node.js 24、完整 JDK 17 或更新版本以及 Git；Windows 原生辅助程序还需要 .NET SDK，macOS 原生辅助程序需要 Xcode Command Line Tools。确认 `node`、`npm`、`javac` 和 `jar` 都在 PATH 中。

```sh
npm ci
node scripts/build-bridge.cjs
npm run dev
```

构建与验证命令、代码分层、平台适配、测试证据和发布流程见 [开发说明](docs/DEVELOPMENT.md)。行为修改需保留旧设置、收藏、图片和实例；用户的整合包、存档与账号凭据不能进入公开源码。

## 许可

项目许可见 [LICENSE](LICENSE)，第三方说明见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) 和 [对应源码说明](docs/CORRESPONDING_SOURCE.md)。请以这些文件中的具体条件为准。

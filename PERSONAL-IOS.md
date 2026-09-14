# iOS Shadowsocks 客户端开发准备

本目录来自 https://github.com/OutlineFoundation/outline-apps 。这是基于 Outline 的开发基础，并非已经重写、测试和发布的新应用。原始许可证和第三方声明保留在仓库中。

## 已完成

- 下载上游源码，包含 iOS App、VPN 扩展、Shadowsocks 通信实现。
- 新增 `build-personal-ios.sh`：通过上游初始化流程构建 Release 配置，并包装未签名 IPA。
- 新增 GitHub Actions 流程 `Personal iOS unsigned IPA`，在 macOS runner 上构建，保存 IPA 和 SHA-256 校验值 14 天。支持手动触发，以及构建脚本变更时自动触发。
- 已创建个人仓库：https://github.com/huazhu624-tech/shadowsocks-ios 。
- 已修复个人 Release 构建强制要求 SENTRY_DSN 的问题；未配置时不设置远端错误报告地址。
- 云端 Release 编译和上传已成功：https://github.com/huazhu624-tech/shadowsocks-ios/actions/runs/34893867664 。
- 下载地址：https://github.com/huazhu624-tech/shadowsocks-ios/actions/runs/34893867664/artifacts/10368295893 。需登录 GitHub，产物到期时间为 2026-09-28。
- 已下载产物并验证 SHA-256，包内包含 arm64 iOS App 和 VPN 扩展。App 版本 0.1.0，最低 iOS 15.5。

## 尚未完成

- 当前电脑仅有 Command Line Tools，没有完整 Xcode；构建已在 GitHub macOS runner 验证。
- 0.2.0 已配置独立 App ID、显示名称和共享组；保留 Outline 原有主要界面与功能。
- 尚未签名、安装或进行真机网络测试。

## 构建

0.2.0 新增 App / VPN 扩展版本对齐、arm64 和包标识一致性检查，并在产物中附带 `package-manifest.json` 与 `PERSONAL-SIGNING.md`。上方 0.1.0 下载链接为历史构建；最新构建请在 Actions 中查看。

本地需要完整 Xcode、iPhoneOS SDK、Node 22，以及根目录 go.mod 指定的 Go 版本。

```sh
npm ci
bash build-personal-ios.sh
```

将项目上传到自己的 GitHub 仓库后，进入 Actions，选择 `Personal iOS unsigned IPA`，点击 Run workflow。构建成功后可以从该次运行的 Artifacts 下载压缩包。该文件是未签名 IPA，不是直接安装链接。

## 安装条件

App 和内嵌 VPN 扩展需要各自有效的签名、描述文件及匹配的 Network Extension / App Groups 权限。普通免费账号或任意自签工具不一定支持这些权限，不能承诺可用。正式分发前需要配置自己的 Bundle ID、App Groups 和开发团队，再使用对应分发方式导出安装包。不要将证书私钥、密码或服务器访问密钥提交到仓库。

没有签名条件、只希望先使用客户端时，可使用官方 App Store 版本（可用性取决于账号地区）：https://apps.apple.com/us/app/outline-app/id1356177741 。安装后仍需要自己的服务器访问密钥；软件本身不附送节点。

参考：https://github.com/OutlineFoundation/outline-apps/tree/master/client/src/cordova/apple

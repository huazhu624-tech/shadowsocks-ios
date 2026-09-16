# Personal VPN for Windows 0.1.0

基于 Outline 的个人 Windows 客户端（Apache-2.0），保留其 Shadowsocks VPN 功能和主要界面。此版本并非全新重写的 VPN 协议实现。原始许可证与第三方声明保留。

适用目标：普通 Intel / AMD 电脑的 Windows 10 / 11。应用为 x86 架构，可在 x64 Windows 中运行；本次不提供 ARM64 原生版。

## 安装与使用

1. 解压下载文件，运行 `PersonalVPN-0.1.0-ia32-Setup.exe`，安装路由服务和 TAP 驱动时需要管理员授权。
2. 打开 Personal VPN，添加自己的 `ss://` 访问密钥，然后连接。软件不附带节点或订阅。
3. 连接后测试网站访问，断开后确认普通网络恢复；也应测试 Wi-Fi / 有线切换和重启恢复。
4. 不用时从 Windows 设置中卸载 Personal VPN。安装程序会移除自己的服务，保留共享 TAP 驱动，避免影响其他应用。

发布者未做 Authenticode 签名，Windows 可能显示未知发布者或阻止运行。此包不要求关闭 Defender、驱动签名校验或其他系统保护。如组织策略禁止未签名应用，需要管理员批准或使用官方签名版。

服务名和通信管道已独立为 `PersonalVPNService` / `PersonalVPNServicePipe`，自动更新已关闭，避免个人版被上游版本替换。底层 TAP 网络接口仍沿用上游配置，请不要同时连接本客户端与官方 Outline 桌面版。

## 验证范围

GitHub Actions 会编译客户端、Go 网络组件和 Windows 服务，检查安装程序及必需二进制的 PE 文件头，并生成 SHA-256。构建成功不等于已完成 Windows 真机安装或实际节点联网测试。

## 从源码构建

使用 Windows、Node 22、go.mod 指定的 Go、Zig 0.13.0、Visual Studio 2022 / MSBuild。执行仓库 `.github/workflows/personal-windows.yml` 中的步骤。`prepare.mjs` 修改构建副本中的服务标识，应只在干净副本执行一次。

安装包下载来自本仓库 Actions 产物；证书、设备登记文件、代理访问密钥不包含在源码或安装包内。

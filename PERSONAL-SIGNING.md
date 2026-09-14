# 个人代理 0.2.0 签名交接

基于 Outline（Apache-2.0）。目标设备：iPhone 15 Pro Max，用户提供的系统版本 iOS 26.5.2。尚未完成真机兼容性或网络测试。IPA 未签名，不能通过普通下载链接直接安装。

## 两个需要签名的目标

| 项目 | 标识 |
| --- | --- |
| 主 App | `io.github.huazhu624tech.shadowsocks` |
| 内嵌 VPN 扩展 | `io.github.huazhu624tech.shadowsocks.VpnExtension` |
| 两者的共享 App Group | `group.io.github.huazhu624tech.shadowsocks` |

主 App 和 VPN 扩展均需要对应签名和描述文件，授权 `com.apple.developer.networking.networkextension` 的 `packet-tunnel-provider`，以及上述 `com.apple.security.application-groups`。采用 Ad Hoc 分发时，两个描述文件必须包含目标手机的 UDID，并使用同一团队。

若签名服务需要改标识，扩展标识必须保持“主 App 标识 + `.VpnExtension`”。若更改共享组，还必须同步修改主 App 与扩展 Info.plist 中的 `PersonalAppGroup`，以及两者签名 entitlements / 描述文件中的共享组。先修改内容，再完成签名；签名后修改文件会破坏签名。不要仅签主 App 或删除 VPN 扩展。

KravaSign 仅为候选渠道，本项目不依赖该服务。尚未获得其对本包权限组合或目标系统的确认，也未购买证书。普通 IPA 重签成功不等于 VPN 可以启动。

## 验收

1. 检查两个目标的签名、描述文件有效期、设备 UDID 和实际授权的 entitlement。
2. 安装到目标手机，确认能打开 App、导入自己的 `ss://` 访问密钥并授权 VPN。
3. 验证连接、断开、重新连接、锁屏恢复，以及 Wi-Fi / 蜂窝网络切换后的真实联网能力。

包内 `package-manifest.json` 只记录结构检查结果，不能证明签名有效或真机可用。软件不附带代理服务器。证书私钥、密码、UDID 和服务器访问密钥不要提交到公开仓库。

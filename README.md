# Clash-Rule

自用代理配置合集 —— 一套分流思路，三种客户端版本。

## 📥 导入链接

| 配置 | raw 直链 | 镜像 |
|------|----------|------|
| Clash_rule.js | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Clash_rule.js) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Clash_rule.js) |
| Stash 配置 | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Stash_conf.yaml) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Stash_conf.yaml) |
| Surfboard 配置 | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Surfboard.conf) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Surfboard.conf) |

> 国内网络建议用镜像，两者内容相同。

## ✨ 通用特性

三个客户端共有的设计：

- **应用独立分流**：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV / X / YouTube 各一个策略组，出口可跟随主代理、直连或指定地区
- **TV 聚合组**：Netflix · Disney+ · HBO · Prime Video · Apple TV+ 共用一个策略组
- **地区自动测速组**：按节点名自动识别地区，url-test 自动择优，隐藏不占面板
- **广告拦截**：广告域名规则层 REJECT
- **国内外分流**：私网与国内域名 / IP 直连，海外域名走主代理，MATCH 兜底
- **对时保护**：NTP（UDP 123）强制直连，避免节点丢 UDP 导致 TLS 证书校验失败
- **真实 IP 豁免**：NTP / STUN / 游戏主机 / 系统连通性检测域名不参与代理 DNS
- **规则集自动更新**：全部规则集每周静默更新
- **不含节点**：仅规则与策略框架，订阅 / 节点由使用者自行填入

---

## 各配置特点

### 一、Clash_rule.js（mihomo 覆写脚本）

适用：Clash Verge Rev / Mihomo Party / ClashMi / FlClash / Bettbox 等支持 JS 覆写的 mihomo 客户端。在「覆写」处导入链接即用，全自动生成配置：

- 23 个地区动态识别，同地区 ≥2 个节点才建组，无多余空组
- 应用组出口可选：主代理 / 直连 / 动态地区组 / 任意单个节点，粒度最细
- DNS 智能继承订阅解析策略并清洗失效引用；广告域名 DNS 层直接拒绝（零流量）
- 节点全自动增强：uTLS chrome 指纹补全、双栈并发、自然排序、重名去重
- HTTP / TLS / QUIC 全协议嗅探，纯 IP 流量也能还原域名参与分流
- 自动过滤「剩余流量 / 到期 / 客服 / 群」等伪节点

要求：较新版本 mihomo（建议 1.18+）；仅支持节点平铺订阅（不支持 `proxy-providers`）；首次启动需联网下载规则集，请在日志确认全部成功。

### 二、Stash

适用：iOS / iPadOS / macOS / tvOS 的 Stash。从 URL 下载配置，把 `proxy-providers` 里的「你的真实订阅链接」替换为实际订阅。

特点：

- fake-ip DNS，国内域名单独指回国内解析器，保留 CDN 就近调度
- 5 个固定地区组：HK / JP / SG / TW / US
- 订阅自动过滤伪节点（provider filter）

### 三、Surfboard

适用：Android 的 Surfboard。从 URL 导入后，把「静态」组 `policy-path` 中的占位符替换为实际订阅链接（Surge 格式），再为各业务组选出口：

- 双栈 DoH 防污染 DNS（阿里 223.5.5.5 + 腾讯 1.12.12.12）
- 5 个地区组：HK / JP / TW / SG / US，从「静态」节点池按正则捞取
- 规则集来自 Repcz/Tool（Surge 纯文本格式，平台限制）
- GeoIP CN 直连兜底

---

> 所有配置导入后，请先在日志中确认规则集全部下载成功。

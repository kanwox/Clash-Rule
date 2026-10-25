# Clash-Rule

同一套分流思路的三个客户端版本：**mihomo 覆写脚本 · Stash 配置 · Surfboard 配置**。

## 📥 导入链接

| 配置 | 适用 | raw 直链 | 镜像 |
|------|------|----------|------|
| Clash_rule.js | mihomo 内核客户端 | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Clash_rule.js) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Clash_rule.js) |
| Stash 配置 | iOS / iPadOS / macOS / tvOS | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Stash_conf.yaml) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Stash_conf.yaml) |
| Surfboard 配置 | Android | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Surfboard.conf) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Surfboard.conf) |

> 国内网络建议用镜像，两者内容相同。

## 一、Clash_rule.js（mihomo 覆写脚本）

**怎么用**：在客户端「覆写」处导入链接（或粘贴脚本内容），导入即用，不需要改任何东西。

要求：较新版本 mihomo 内核（建议 1.18+），如 Clash Verge Rev / Mihomo Party / ClashMi / FlClash / Bettbox；仅支持节点平铺的订阅，不支持 `proxy-providers`；首次启动需联网下载规则集。

相比另外两份多做的部分：

- 23 个地区动态识别，同地区 ≥2 个节点才自动建组
- 应用组出口可选主代理 / 直连 / 地区组 / 任意单个节点，粒度最细
- DNS 智能继承订阅原有解析策略并清洗失效引用；广告域名在 DNS 层直接拒绝（零流量）
- 节点全自动增强：uTLS 指纹补全、双栈并发、自然排序、重名去重
- HTTP / TLS / QUIC 全协议嗅探，纯 IP 流量也能还原域名参与分流
- 自动过滤「剩余流量 / 到期 / 客服 / 群」等伪节点

## 二、Stash

**怎么用**：从 URL 下载配置，把 `proxy-providers` 里的「你的真实订阅链接」替换为实际订阅。

适用客户端：Stash（iOS / iPadOS / macOS / tvOS）。

它的特点：

- fake-ip DNS，国内域名单独指回国内解析器，保留 CDN 就近调度
- 5 个固定地区组：HK / JP / SG / TW / US
- 订阅自动过滤伪节点（provider filter）

## 三、Surfboard

**怎么用**：从 URL 导入配置，把「静态」组 `policy-path` 中的占位符替换为实际订阅链接（须为 Surge 格式），再为各业务组选出口。

适用客户端：Surfboard（Android）。

它的特点：

- 双栈 DoH 防污染 DNS（阿里 223.5.5.5 + 腾讯 1.12.12.12）
- 5 个地区组：HK / JP / TW / SG / US，从「静态」节点池按正则捞取
- GeoIP CN 直连兜底

## ✨ 通用特性

三份配置共有的底座，选择时无需比较：

- **应用独立分流**：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV / X / YouTube 各一个策略组
- **TV 聚合组**：Netflix · Disney+ · HBO · Prime Video · Apple TV+ 共用一个策略组
- **地区自动测速组**：按节点名识别地区，自动择优
- **广告拦截**：广告域名 REJECT
- **国内外分流**：私网与国内域名 / IP 直连，海外域名走主代理
- **对时与真实 IP 保护**：NTP 强制直连；NTP / STUN / 游戏主机 / 连通性检测域名不参与代理 DNS
- **规则集自动更新**：全部规则集每周静默更新
- **不含节点**：仅规则与策略框架，订阅 / 节点由使用者自行填入

> 所有配置导入后，请先在日志中确认规则集全部下载成功。

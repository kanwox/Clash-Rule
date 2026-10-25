# Proxy Rules

| 配置 | raw 直链 | 镜像 |
|------|----------|------|
| `Clash_rule.js` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Clash_rule.js) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Clash_rule.js) |
| `Stash_conf.yaml` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Stash_conf.yaml) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Stash_conf.yaml) |
| `Surfboard.conf` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Surfboard.conf) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Surfboard.conf) |

## 一、Clash_rule.js

要求 mihomo 内核 1.18+，仅支持节点平铺订阅。

- 23 个地区，同地区 ≥2 个节点才建组
- 应用组出口可选主代理 / 直连 / 地区组 / 单个节点
- DNS 继承订阅原有解析策略并清洗失效引用，广告域名 DNS 层拒绝
- 节点增强：uTLS 指纹补全、双栈并发、自然排序、重名去重
- HTTP / TLS / QUIC 嗅探，纯 IP 流量还原域名参与分流
- 过滤「剩余流量 / 到期 / 客服 / 群」等伪节点

## 二、Stash

- fake-ip DNS，国内域名指回国内解析器
- 地区组：HK / JP / SG / TW / US
- 订阅过滤伪节点

## 三、Surfboard

- 地区组：HK / JP / TW / SG / US，从「静态」节点池按正则捞取
- GeoIP CN 直连

## ✨ 通用特性

三份配置共有：

- **应用独立分流**：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV / X / YouTube 各一个策略组
- **TV 聚合**：Netflix · Disney+ · HBO · Prime Video · Apple TV+ 共用一个策略组
- **地区测速组**：按节点名识别地区，自动择优
- **分流**：私网与国内域名 / IP 直连，海外域名走主代理，广告域名 REJECT
- **对时与真实 IP 保护**：NTP 强制直连；NTP / STUN / 游戏主机 / 连通性检测域名不参与代理 DNS
- **规则集每周自动更新**
- **不含节点**

> 首次加载需联网下载规则集。

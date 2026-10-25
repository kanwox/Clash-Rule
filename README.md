# Proxy Rule

## 📥 导入链接

| 配置 | 镜像链接 |
|------|----------|
| Clash_rule.js | `https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Clash_rule.js` |
| Stash_conf.yaml | `https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Stash_conf.yaml` |
| Surfboard.conf | `https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Surfboard.conf` |

<br>

## 🐱 Clash_rule.js

- 23 个地区，同地区 ≥2 个节点才建组
- 应用组出口可选主代理 / 直连 / 地区组 / 单个节点
- fake-ip DNS，继承订阅原有解析策略并清洗失效引用，广告域名 DNS 层拒绝
- fake-ip 豁免清单：内置 + 社区规则集
- 节点增强：uTLS 指纹补全、双栈并发、自然排序、重名去重
- 统一延迟、TCP 并发、保活调优
- HTTP / TLS / QUIC 嗅探，纯 IP 流量还原域名参与分流
- 规则集 mrs 二进制格式
- 过滤「剩余流量 / 到期 / 客服 / 群」等伪节点

要求 mihomo 内核 1.18+，仅支持节点平铺订阅。

<br>

## 🐦 Stash_conf.yaml

- fake-ip DNS，国内域名指回国内解析器
- 地区组：HK / JP / SG / TW / US
- 订阅过滤伪节点
- 规则集 mrs 二进制格式

<br>

## 🏄 Surfboard.conf

- 地区组：HK / JP / TW / SG / US，从「静态」节点池按正则捞取
- GeoIP CN 直连
- 规则集 Surge list 纯文本格式

<br>

## ✨ 通用特性

三份配置共有：

```text
分流顺序：私网 / 广告 / 对时 → 应用独立分流 → 国内直连 → 海外兜底

主代理
├─ 地区测速组（自动识别，隐藏）
├─ 静态（全部节点）
└─ DIRECT
AI · Apple · GitHub · Google · Microsoft · Spotify · Telegram · TikTok · TV · X · YouTube（出口独立可选）
```

- **TV 聚合**：Netflix · Disney+ · HBO · Prime Video · Apple TV+ 共用一个策略组
- **真实 IP 豁免**：NTP / STUN / 游戏主机 / 连通性检测域名不参与代理 DNS
- **规则集每周自动更新**
- **不含节点**

> 首次加载需联网下载规则集。

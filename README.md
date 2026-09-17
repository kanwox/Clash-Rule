# Clash_rule.js

**mihomo（Clash Meta 内核）配置覆写脚本 —— 高效运行 · 稳定使用 · 方便简洁**

## 📥 脚本链接

```text
https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Clash_rule.js
```

---

## ✨ 功能

**🔀 分流**
- 广告拦截（REJECT，不产生任何流量）
- 12 个应用独立分流：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV（Netflix·Disney+·HBO·Prime Video·Apple TV+）/ Twitch / X / YouTube
- 私有网络直连 → 国内域名/IP 直连 → 其余走主代理
- 自动过滤节点名中的"剩余流量/到期时间/客服/群"等提示性伪节点，不占用测速组

**🎯 策略组**
- 主代理 / 静态 / 隐藏直连，结构极简
- 23 个地区动态识别：同地区 ≥2 个节点才自动建组，测速组全部隐藏、不占面板
- 订阅使用代理集合时自动切换为全量地区组，不会误判

**🌐 DNS**
- fake-ip 模式，国内外分流解析
- 机场专属 DNS 优先且独占使用；未设置时智能继承订阅原有解析策略，防止公共 DNS 抢答专线解析
- 广告域名直接返回解析失败
- 自动清洗订阅残留的失效 DNS 引用（rule-set / geosite / 失效组名后缀）；遇到无法安全迁移的复杂 DNS 配置会主动报错阻止生成，避免产生语义错误的配置
- fake-ip 豁免全覆盖：系统对时 / STUN / 游戏主机 / 连通性检测（内置清单 + 社区规则集双保险）

**⚡ 性能与稳定**
- 规则集全量 mrs 二进制格式 + 本地缓存：加载快、内存占用低
- 广告规则周更，其余月更
- HTTP / TLS / QUIC 全协议嗅探，纯 IP 流量也能还原域名参与分流；小米云服务、Apple、OpenAI 等敏感服务跳过嗅探
- TCP 保活参数调优，移动端显著省电

**🔧 节点增强（全自动，无需手动配置）**
- vless / vmess / trojan 自动补全 uTLS chrome 指纹
- 统一双栈并发连接（IPv4/IPv6 同时测速择优)
- 机场订阅节点经 override 同步生效以上全部增强

## 📦 使用

| 项目 | 说明 |
|------|------|
| 内核要求 | 较新版本 mihomo |
| 适用客户端 | Clash Verge Rev / Mihomo Party / ClashMi / FlClash / Bettbox 等支持 JS 覆写的客户端 |
| 安装方式 | 在客户端「覆写」处通过上方链接或复制粘贴导入本脚本 |
| 注意事项 | 首次启动需联网下载规则集，请在日志中确认全部下载成功 |

---
> 绝大多数情况下无需手动配置，导入即用；遇到极少数无法安全迁移的复杂配置会明确提示，而非静默生成错误配置。

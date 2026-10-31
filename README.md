<div align="center">

<img src="https://cdn.jsdmirror.com/gh/Koolson/Qure@master/IconSet/Color/Proxy.png" width="72" alt="Logo" />

# Proxy Rule

**高效运行 · 稳定使用 · 智能分流**

一套面向现代代理客户端的高性能分流规则库

[![Clash](https://img.shields.io/badge/Clash-5B8DEF?logo=github&logoColor=white)](./Clash/)
[![Egern](https://img.shields.io/badge/Egern-0EA5E9?logo=apple&logoColor=white)](./Egern/)
[![Loon](https://img.shields.io/badge/Loon-4B7BEC?logo=apple&logoColor=white)](./Loon/)
[![Quantumult X](https://img.shields.io/badge/Quantumult%20X-7C3AED?logo=apple&logoColor=white)](./QuantumultX/)
[![Shadowrocket](https://img.shields.io/badge/Shadowrocket-FF6B35?logo=apple&logoColor=white)](./Shadowrocket/)
[![Stash](https://img.shields.io/badge/Stash-10B981?logo=apple&logoColor=white)](./Stash/)
[![Surfboard](https://img.shields.io/badge/Surfboard-F59E0B?logo=android&logoColor=white)](./Surfboard/)
[![Surge](https://img.shields.io/badge/Surge-111827?logo=apple&logoColor=white)](./Surge/)
[![Ruleset](https://img.shields.io/badge/Ruleset-MRS%20%2F%20LIST-8B5CF6)](#-核心架构)

</div>

---

## 📥 导入链接

| 客户端 | 直达链接 (Raw) | 镜像链接 (jsdmirror) | 配置说明 |
| :--- | :--- | :--- | :--- |
| **Clash / Mihomo** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Clash/Clash_rule.js) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Clash/Clash_rule.js` | [📖 查看文档](./Clash/) |
| **Egern** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Egern/Egern.yaml) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Egern/Egern.yaml` | [📖 查看文档](./Egern/) |
| **Loon** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Loon/Loon.conf) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Loon/Loon.conf` | [📖 查看文档](./Loon/) |
| **Quantumult X** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/QuantumultX/QuantumultX.conf) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/QuantumultX/QuantumultX.conf` | [📖 查看文档](./QuantumultX/) |
| **Shadowrocket** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Shadowrocket/Shadowrocket.conf) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Shadowrocket/Shadowrocket.conf` | [📖 查看文档](./Shadowrocket/) |
| **Stash** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Stash/Stash.yaml) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Stash/Stash.yaml` | [📖 查看文档](./Stash/) |
| **Surfboard** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Surfboard/Surfboard.conf) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Surfboard/Surfboard.conf` | [📖 查看文档](./Surfboard/) |
| **Surge** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Surge/Surge.conf) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Surge/Surge.conf` | [📖 查看文档](./Surge/) |

> 💡 提示：首次使用需联网拉取远程规则集；导入前请参阅对应客户端说明配置订阅。

---

## 🧩 核心架构

各端配置保持统一的分流策略与交互设计，标配 **HK / JP / SG / TW / US** 常用地区测速组：

```text
主代理
├─ 地区测速组 (HK / JP / SG / TW / US，默认隐藏)
├─ 静态 (有效节点平铺，便捷手动选点)
└─ DIRECT (直连)

13 大独立业务组 (可任意指定主代理 / 地区组 / 直连 / 具体节点)
├─ 常用平台：Google · Apple · Microsoft · GitHub · Telegram · X · YouTube · TikTok · Spotify · Steam · PayPal
├─ 人工智能：AI (ChatGPT · Claude · Gemini)
└─ 流媒体聚合：TV (Netflix · Disney+ · HBO · Prime Video · Apple TV+)

分流流水线
局域网/私网 ➜ 广告拦截 ➜ NAS/NTP对时直连 ➜ 核心应用分流 ➜ 海外常用服务 ➜ 大陆域名/IP直连 ➜ 兜底组 (主代理)
```

- **真实 IP 白名单**：网络对时 (NTP)、STUN 探测、系统连通性测试及游戏联机直连走真实 IP，避免 Fake-IP 带来连通性异常。
- **分层广告防护**：Mihomo、Loon 与 Quantumult X 支持 DNS 层面拒绝；各端均保留规则层 `REJECT`，Surge 与 Shadowrocket 开启预匹配优化。
- **远程规则托管**：主流平台业务规则与群晖服务规则集支持自动定期拉取更新，保持长期低维护可用。

---

## ❓ 常见问题

<details>
<summary><b>Q: 为什么首次启动较慢或部分海外网站打不开？</b></summary>
<br>

**A:** 首次加载需联网拉取远程规则集（`.mrs` / `.list` / `.yaml`）。请在客户端日志中确认规则集下载是否成功。
</details>

<details>
<summary><b>Q: 为什么个别地区策略组没有显示或不可用？</b></summary>
<br>

**A:** 策略组根据节点名称正则自动归类，请确认订阅中是否包含对应地区的有效节点。各端默认过滤了包含“流量/到期/官网”等非节点信息条目。
</details>

---

<div align="center">
<sub>仅供网络路由测试与技术交流 · 不提供任何网络节点 · 请遵守当地法律法规</sub>
</div>

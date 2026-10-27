<div align="center">

<img src="assets/github.png" width="72" alt="Logo" />

# Proxy Rule

**高效运行 · 稳定使用 · 智能分流**

一套面向现代代理客户端（Mihomo / Stash / Surfboard）的高性能分流规则库

[![mihomo](https://img.shields.io/badge/Kernel-Mihomo%201.18%2B-5B8DEF?logo=github&logoColor=white)](#1-clash_rulejs-mihomo-预处理脚本)
[![Stash](https://img.shields.io/badge/Platform-Stash-10B981?logo=apple&logoColor=white)](#2-stashyaml-stash-完整配置)
[![Surfboard](https://img.shields.io/badge/Platform-Surfboard-F59E0B?logo=android&logoColor=white)](#3-surfboardconf-surfboard-配置文件)
[![Ruleset](https://img.shields.io/badge/Ruleset-MetaCubeX%20mrs-8B5CF6)](#-核心架构)

</div>

---

## 📥 导入链接

| 配置文件 | 直达链接 (Raw) | 镜像链接 (jsdmirror) | 适用客户端 |
| :--- | :--- | :--- | :--- |
| **`Clash_rule.js`** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Clash_rule.js) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Clash_rule.js` | Clash Verge Rev / Mihomo Party / Nyanpasu 等 |
| **`Stash.yaml`** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Stash.yaml) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Stash.yaml` | Stash (iOS / macOS / Windows) |
| **`Surfboard.conf`** | [查看原文件](https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Surfboard.conf) | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Surfboard.conf` | Surfboard (Android) |

> 💡 提示：首次加载需联网拉取规则集，若直连缓慢推荐使用镜像链接。

---

## ⚡ 配置速通

### 1. Clash_rule.js (Mihomo 预处理脚本)
适用于支持 JavaScript 扩展脚本的 Mihomo 内核客户端（内核需 ≥ 1.18.0，仅支持节点平铺订阅）：
- **使用方法**：在客户端（如 Clash Verge Rev / Mihomo Party）中，进入订阅管理 → 右键订阅选择「编辑脚本 / 扩展配置」→ 贴入脚本代码并更新订阅。
- **特性**：
  - **自动分组**：涵盖 23 个国家/地区，同地区节点 ≥2 个自动创建独立测速组（`url-test`）。
  - **连接嗅探**：启用 HTTP/TLS/QUIC 嗅探与 `parse-pure-ip`，纯 IP 流量精准还原域名分流。
  - **DNS 优化**：Fake-IP (ARC 算法)，国内域名由本地 DoH 解析，广告域名 DNS 层直接拒绝。
  - **节点净化**：自动剔除剩余流量/到期等信息节点；重名节点自动重命名容错；自动补全 Chrome uTLS 指纹。

### 2. Stash.yaml (Stash 完整配置)
适用于 Stash 客户端，开箱即用：
- **使用方法**：下载文件导入 Stash，在顶部 `proxy-providers.All.url` 处填入你的真实订阅链接。
- **特性**：内置 5 大常用地区测速组、13 个独立应用分流、mrs 二进制规则集与精细 Fake-IP 过滤。

### 3. Surfboard.conf (Surfboard 配置文件)
适用于 Android 端 Surfboard 客户端：
- **使用方法**：用文本编辑器打开，将 `[Proxy Group]` 中 `静态` 组的 `policy-path="在这里填写订阅链接"` 替换为真实订阅，导入客户端即可。
- **特性**：支持主流地区正则筛选、国内直连与分流对齐。

---

## 🧩 核心架构

三份配置保持统一的分流策略与交互设计：

```text
主代理
├─ 地区自动测速组 (HK / JP / SG / US / TW ... 自动识别，默认折叠)
├─ 静态 (所有有效节点平铺，便捷选点)
└─ DIRECT (直连)

13 大独立业务组 (可选主代理 / 独立地区 / 直连 / 具体节点)
├─ 常用平台：Google · Apple · Microsoft · GitHub · Telegram · X · YouTube · TikTok · Spotify · Steam · PayPal
├─ 人工智能：AI (ChatGPT · Claude · Gemini)
└─ 流媒体聚合：TV (Netflix · Disney+ · HBO · Prime Video · Apple TV+)

分流流水线
局域网/私网 ➜ 广告拦截 ➜ NAS/NTP对时直连 ➜ 核心应用分流 ➜ 海外常用服务 ➜ 大陆域名/IP直连 ➜ 兜底组 (主代理)
```

- **真实 IP 白名单**：系统对时 (NTP)、STUN、微软/苹果连通性探测、游戏联机等直连不经假 IP。
- **双层广告防护**：DNS 层 `rcode://name_error` 拒答 + 规则层 `REJECT` 拦截。
- **每周自动更新**：规则集统一设置 7 天自动同步。

---

## ⚙️ 进阶调整 (Clash_rule.js)

如需微调行为，可直接修改 `Clash_rule.js` 头部常量：

| 参数 | 默认值 | 说明 |
| :--- | :--- | :--- |
| `DEFAULT_IP_VERSION` | `"dual"` | 双栈策略：`dual` (并发择优) / `ipv6-prefer` / `ipv4-prefer` |
| `REGION_MIN_NODES` | `2` | 达到该节点数才创建对应地区测速组 |
| `BLOCK_QUIC` | `false` | 阻断 UDP 443 迫使回退 TCP（节点 UDP 质量差时可开） |
| `RS_INTERVAL` | `604800` | 规则集自动更新周期（秒，默认 7 天） |

---

## ❓ 常见问题

<details>
<summary><b>Q: 为什么提示「检测到 proxy-providers 订阅，已拒绝生成」？</b></summary>

`Clash_rule.js` 需在配置阶段解析节点属性并生成动态策略组。`proxy-providers` 延迟加载导致无法静态读取节点列表，请改用普通平铺节点订阅。
</details>

<details>
<summary><b>Q: 为什么部分海外网站打不开或首次启动卡住？</b></summary>

首次启动需从 CDN 下载远程规则集（`.mrs` 文件），请确保日志中所有规则集更新完毕；若无法拉取，请开启网络代理环境或检查镜像源连通性。
</details>

---

<div align="center">
<sub>仅供网络路由测试与技术交流 · 不提供任何网络节点 · 请遵守当地法律法规</sub>
</div>

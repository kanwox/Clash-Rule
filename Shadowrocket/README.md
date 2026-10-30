# Shadowrocket

适用于 Shadowrocket 客户端（iOS / macOS / tvOS）。

---

## 📥 导入链接

| 类型 | 链接 |
| :--- | :--- |
| **直达链接 (Raw)** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Shadowrocket/Shadowrocket.conf` |
| **镜像链接 (jsdmirror)** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Shadowrocket/Shadowrocket.conf` |

---

## 📖 使用方法

1. 在 Shadowrocket 首页添加节点订阅。
2. 复制上方配置链接，在客户端「配置」中添加远程配置并下载使用（或导入本地 [Shadowrocket.conf](./Shadowrocket.conf)）。
3. 策略组会自动筛选全部订阅节点，无需在配置文件中手动填写订阅地址。

---

## ✨ 核心特性

- **原生策略组**：通过 `policy-regex-filter` 自动按地区正则归类节点，五大地区组使用 `url-test`。
- **免改配置**：直接复用客户端全局节点池，开箱即用。
- **安全与拦截**：内置 DoH 加密 DNS、真实 IP 白名单与广告预匹配规则。

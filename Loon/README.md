# Loon

适用于 Loon 客户端（iOS / macOS / tvOS）。

---

## 📥 导入链接

<div align="center">

| 类型 | 链接 |
| :---: | :--- |
| **直达链接** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Loon/Loon.conf` |
| **镜像链接** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Loon/Loon.conf` |

</div>

---

## 📖 使用方法

1. 打开 [Loon.conf](./Loon.conf)。
2. 将 `[Remote Proxy]` 下 `机场订阅` 中的 `订阅链接填写处` 替换为真实订阅：
   ```ini
   [Remote Proxy]
   机场订阅 = 你的真实订阅链接,parser-enabled=false,...
   ```
3. 导入 Loon 客户端并启用。

---

## ✨ 核心特性

- **节点过滤与测速**：通过 `[Remote Filter]` 正则筛选节点，五大地区组使用 `url-test` 自动测速。
- **双栈与 DNS**：采用 `ip-mode = dual`，支持 Fake-IP 白名单与 DNS 层广告拒答。
- **轻量设计**：默认不加载外部资源解析脚本，确保低资源开销。

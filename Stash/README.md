# Stash

适用于 Stash 客户端（iOS / macOS / Windows）。

---

## 📥 导入链接

| 类型 | 链接 |
| :--- | :--- |
| **直达链接 (Raw)** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Stash/Stash.yaml` |
| **镜像链接 (jsdmirror)** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Stash/Stash.yaml` |

---

## 📖 使用方法

1. 打开 [Stash.yaml](./Stash.yaml)。
2. 将顶部 `proxy-providers.All.url` 中的 `订阅链接填写处` 替换为真实订阅：
   ```yaml
   proxy-providers:
     All:
       url: "你的真实订阅链接"
   ```
3. 导入 Stash 客户端并启用。

---

## ✨ 核心特性

- **地区测速**：内置 5 大常用地区测速组（HK / JP / SG / TW / US），正则自动归类节点。
- **规则集**：采用 MetaCubeX mrs 二进制规则集，匹配速度快、占用小。
- **DNS 与嗅探**：精细 Fake-IP 过滤名单与纯 IP 域名嗅探，确保分流精度。

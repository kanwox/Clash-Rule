# Surfboard

适用于 Surfboard 客户端（Android）。

---

## 📥 导入链接

<div align="center">

| 类型 | 链接 |
| :---: | :--- |
| **直达链接** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Surfboard/Surfboard.conf` |
| **镜像链接** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Surfboard/Surfboard.conf` |

</div>

---

## 📖 使用方法

1. 打开 [Surfboard.conf](./Surfboard.conf)。
2. 找到 `[Proxy Group]` 下的 `静态` 策略组，将 `policy-path="订阅链接填写处"` 替换为真实订阅：
   ```ini
   静态 = select, policy-path="你的真实订阅链接", update-interval=86400, ...
   ```
3. 导入 Surfboard 客户端并启用。

---

## ✨ 核心特性

- **地区测速**：内置 5 大地区测速组（HK / JP / SG / TW / US），通过正则自动匹配节点。
- **业务分流**：对齐 13 大独立业务组与国内直连分流。
- **DNS 白名单**：配置常用系统服务 real-ip 直连，广告规则层直接拦截。

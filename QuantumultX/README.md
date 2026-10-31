# Quantumult X

适用于 Quantumult X 客户端（iOS）。

---

## 📥 导入链接

<div align="center">

| 类型 | 链接 |
| :---: | :--- |
| **直达链接** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/QuantumultX/QuantumultX.conf` |
| **镜像链接** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/QuantumultX/QuantumultX.conf` |

</div>

---

## 📖 使用方法

1. 打开 [QuantumultX.conf](./QuantumultX.conf)。
2. 将 `[server_remote]` 中的 `订阅链接填写处` 替换为真实订阅：
   ```ini
   [server_remote]
   你的真实订阅链接, tag=All, update-interval=86400, opt-parser=true, enabled=true
   ```
3. 导入 Quantumult X 客户端并启用。

---

## ✨ 核心特性

- **延迟基准测试**：五大地区组使用 `url-latency-benchmark`，结合资源与节点双正则筛选。
- **策略组映射**：远程规则集全部通过 `force-policy` 接入统一策略组。
- **DNS 白名单**：配置完整的 `dns_exclusion_list`，核心直连服务不经 Fake-IP。

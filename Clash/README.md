# Clash / Mihomo

适用于支持 JavaScript 扩展脚本的 Mihomo 内核客户端（内核需 ≥ 1.18.0，仅支持节点平铺订阅），如 Clash Verge Rev、Mihomo Party 等。

---

## 📥 导入链接

<div align="center">

| 类型 | 链接 |
| :---: | :--- |
| **直达链接** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Clash/Clash_rule.js` |
| **镜像链接** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Clash/Clash_rule.js` |

</div>

---

## 📖 使用方法

1. 打开客户端，进入订阅设置。
2. 选择订阅并编辑其扩展脚本 / 预处理脚本。
3. 复制并贴入 [Clash_rule.js](./Clash_rule.js) 全部内容。
4. 保存并刷新订阅即可。

---

## ✨ 核心特性

- **自动分组**：覆盖 23 个国家/地区，同地区节点 ≥2 个自动创建测速组（`url-test`）。
- **连接嗅探**：启用 HTTP/TLS/QUIC 嗅探与 `parse-pure-ip`，还原真实域名分流。
- **DNS 优化**：Fake-IP (ARC)，国内 DoH 解析，广告域名 DNS 层直接拒答。
- **节点净化**：自动过滤流量/到期等提示节点，重名自动编号，补全 Chrome uTLS 指纹。

---

## ⚙️ 参数微调

如需调整行为，可修改 [Clash_rule.js](./Clash_rule.js) 头部常量：

<div align="center">

| 参数 | 默认值 | 说明 |
| :---: | :---: | :---: |
| `DEFAULT_IP_VERSION` | `"dual"` | 双栈策略：`dual` / `ipv6-prefer` / `ipv4-prefer` |
| `REGION_MIN_NODES` | `2` | 创建地区测速组的最低节点数量 |
| `BLOCK_QUIC` | `false` | 阻断 UDP 443 迫使回退 TCP |
| `RS_INTERVAL` | `604800` | 规则集更新周期（秒，默认 7 天） |

</div>

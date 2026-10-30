# Egern

适用于 Egern 客户端（iOS / macOS / tvOS）。

---

## 📥 导入链接

| 类型 | 链接 |
| :--- | :--- |
| **直达链接 (Raw)** | `https://raw.githubusercontent.com/kanwox/Proxy-Rule/main/Egern/Egern.yaml` |
| **镜像链接 (jsdmirror)** | `https://cdn.jsdmirror.com/gh/kanwox/Proxy-Rule@main/Egern/Egern.yaml` |

---

## 📖 使用方法

1. 打开 [Egern.yaml](./Egern.yaml)。
2. 将 `静态` 策略组中 `urls` 下的 `订阅链接填写处` 替换为真实订阅链接：
   ```yaml
   - name: 静态
     type: select
     urls:
       - "你的真实订阅链接"
   ```
3. 导入 Egern 并启用配置。

---

## ✨ 核心特性

- **原生 YAML**：基于 Egern 原生规范组织分流与策略。
- **Smart 选优**：各地区组通过 `flatten` 展开节点，采用 `smart` 健康检查择优。
- **规则集**：引用 Egern 专用 YAML 规则集，分流对齐主流服务与国内直连。

# Clash-Rule

自用代理配置合集 —— 同一套分流思路（应用独立分流 · 地区自动测速 · 国内直连 · 广告拦截），按客户端各成一版。

## 📑 配置总览

| 配置 | 客户端 / 平台 | 文件 | 形态 |
|------|--------------|------|------|
| Clash_rule.js | mihomo（Clash Meta）内核客户端：Clash Verge Rev / Mihomo Party / ClashMi / FlClash / Bettbox 等 | `Clash_rule.js` | JS 覆写脚本，导入即用，全自动生成配置 |
| Stash 配置 | Stash（iOS / iPadOS / macOS / tvOS） | `Stash/Stash_conf.yaml` | 完整配置文件，填入订阅链接后从 URL 下载 |
| Stash 覆写 | Stash（在已有订阅配置上叠加） | `Stash/Stash_Override.stoverride` | 覆写模块，整段替换 DNS / 策略组 / 规则集 / 规则 |
| SingBox | sing-box（Windows / macOS / Linux / Android / iOS） | `SingBox/SingBox_conf.json` | 模板配置，需手动填入节点 |
| Surfboard | Surfboard（Android） | `Surfboard/Surfboard.conf` | 规则模板，在「静态」组填订阅链接 |

## 📥 导入链接

raw 直链与 jsDelivr 镜像二选一，国内网络建议用镜像：

| 文件 | raw 直链 | jsDelivr 镜像 |
|------|----------|---------------|
| `Clash_rule.js` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Clash_rule.js) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Clash_rule.js) |
| `Stash/Stash_conf.yaml` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Stash/Stash_conf.yaml) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Stash/Stash_conf.yaml) |
| `Stash/Stash_Override.stoverride` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Stash/Stash_Override.stoverride) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Stash/Stash_Override.stoverride) |
| `SingBox/SingBox_conf.json` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/SingBox/SingBox_conf.json) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/SingBox/SingBox_conf.json) |
| `Surfboard/Surfboard.conf` | [raw](https://raw.githubusercontent.com/kanwox/Clash-Rule/main/Surfboard/Surfboard.conf) | [镜像](https://cdn.jsdmirror.com/gh/kanwox/Clash-Rule@main/Surfboard/Surfboard.conf) |

---

## 一、Clash_rule.js（mihomo 覆写脚本）

**mihomo（Clash Meta 内核）配置覆写脚本 —— 高效运行 · 稳定使用 · 方便简洁**

### ✨ 功能

**🔀 分流**
- 广告拦截：DNS 层直接返回解析失败（零流量），规则层 REJECT 兜底
- 12 个应用独立分流：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV（Netflix·Disney+·HBO·Prime Video·Apple TV+）/ Twitch / X / YouTube
- 私有网络与系统对时（NTP）直连 → 应用分流 → 国内域名/IP 直连 → 其余走主代理
- 自动过滤节点名中的"剩余流量/到期时间/客服/群"等提示性伪节点，不占用可选组与测速组

**🎯 策略组**
- 主代理 / 静态 / 隐藏直连，结构极简
- 23 个地区动态识别：同地区 ≥2 个节点才自动建组，测速组全部隐藏、不占面板
- 应用策略组既可跟随主代理、直连或指定地区组，也可直接固定单个节点

**🌐 DNS**
- fake-ip 模式，国内外分流解析
- 机场专属 DNS 优先且独占使用；未设置时智能继承订阅原有解析策略，防止公共 DNS 抢答专线解析
- 搬运订阅原有规则集时自动改写本地缓存路径，避免与内置规则集互相覆写；本地文件型规则集安全丢弃
- 广告域名直接返回解析失败
- 自动清洗订阅残留的失效 DNS 引用（rule-set / geosite / 失效组名后缀），失效引用兜底为跟随路由（#RULES），不可迁移字段一律丢弃；读取异常时输出警告并回退默认配置，不会生成残缺配置
- fake-ip 豁免全覆盖：系统对时 / STUN / 游戏主机 / 连通性检测（内置清单 + 社区规则集双保险）

**⚡ 性能与稳定**
- 规则集全量 mrs 二进制格式 + 本地缓存：加载快、内存占用低
- 规则集每周自动更新
- HTTP / TLS / QUIC 全协议嗅探，纯 IP 流量也能还原域名参与分流；米家云服务、Apple、OpenAI 等敏感服务跳过嗅探
- 开启统一延迟与 TCP 并发，关闭进程匹配开销，调优 TCP 保活参数兼顾移动端电量与连接稳定
- 节点全部被过滤时输出警告日志，避免静默断网

**🔧 节点增强（全自动，无需手动配置）**
- vless / vmess / trojan 自动补全 uTLS chrome 指纹
- 统一双栈并发连接（IPv4/IPv6 并发择优）
- 节点名称按数字自然排序（如 2 排在 10 前），告别字典序错乱
- 与策略组 / 地区组 / 内建 outbound 重名的节点自动改名、订阅内重名节点自动去重，避免内核启动报错

### 📦 使用

| 项目 | 说明 |
|------|------|
| 内核要求 | 较新版本 mihomo（建议 1.18 及以上） |
| 适用客户端 | Clash Verge Rev / Mihomo Party / ClashMi / FlClash / Bettbox 等支持 JS 覆写的客户端 |
| 安装方式 | 在客户端「覆写」处通过上方链接或复制粘贴导入本脚本 |
| 注意事项 | 仅支持节点平铺的订阅（不支持 `proxy-providers` 代理集合）；首次启动需联网下载规则集，请在日志中确认全部下载成功 |

> 绝大多数情况下无需手动配置，导入即用；不可迁移的字段静默丢弃、以脚本默认配置为准，异常时以日志警告，不会生成语义错误或残缺的配置。

---

## 二、Stash

**Stash 规则分流配置 —— 精细化规则分流与 DNS 优化（iOS / iPadOS / macOS / tvOS）**

### ✨ 功能

- 12 个应用独立策略组：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV（Netflix·Disney+·HBO·Prime Video·Apple TV+）/ Twitch / X / YouTube
- 5 个地区自动测速组（HK / JP / SG / TW / US），隐藏不占面板，正则自动识别地区节点
- 广告 / 跟踪域名自动 REJECT，国内域名与 IP 直连，其余走主代理
- 规则集全量 MetaCubeX MRS 二进制格式 + 本地缓存，每周静默更新
- fake-ip DNS：通用解析用国内可直连 DoH（AliDNS / 腾讯），国内域名单独指回国内解析器保留 CDN 就近调度；NTP / STUN / 游戏主机 / 连通性检测全部豁免假地址
- 订阅自动过滤"流量 / 到期 / 客服 / 官网"等提示性伪节点

### 📦 两个文件的区别

| 文件 | 适用场景 |
|------|----------|
| `Stash_conf.yaml` | 完整配置文件：适合从零开始使用，需把 `proxy-providers` 中的 `你的真实订阅链接` 替换为实际订阅 |
| `Stash_Override.stoverride` | 覆写模块：适合已导入其它订阅/配置、只想套用本分流方案的场景，通过 `#!replace` 整段替换 DNS、策略组、规则集与规则，节点保持原配置不动 |

### 📦 使用

1. 复制上方导入链接
2. Stash → 配置（或 覆写）→ 从 URL 下载
3. 使用完整配置时，替换文件内的订阅占位符；使用覆写模块时直接启用即可
4. 选择策略模式并开启代理

---

## 三、SingBox

**sing-box 模板配置 —— 应用分流 + 地区测速 + Game/Steam 分组**

### ✨ 功能

- 8 个业务分组：AI / Apple / Google / YouTube / TV（Netflix·Disney+·Spotify）/ Game（Steam）/ Telegram，外加主代理与静态选择器
- 6 个地区自动测速组（HK / JP / KR / SG / TW / US）
- 广告与 BT（BitTorrent）流量直接拒绝，国内域名 / IP 与私网直连，其余走主代理
- DNS 分流：国外域名走 1.1.1.1 DoH（经代理），国内域名走 223.5.5.5 DoH（直连），fake-ip 模式，拒绝 AAAA / HTTPS-SVCB 查询，广告域名拒绝解析
- 16 个 MetaCubeX srs 二进制规则集，每 168 小时自动更新
- 本地缓存（`cache_file`）持久化 fake-ip 映射与节点选择

### 📦 使用

1. 下载 `SingBox_conf.json`（或用上方链接）
2. 把 `outbounds` 中所有 `"__NODE_PLACEHOLDER__"` 替换为你的节点（「Static」选择器与 6 个地区测速组）
3. 通过 sing-box 内核或 GUI 客户端（SFA / SFM / SFI 等）加载运行
4. 本地混合入站监听 `127.0.0.1:2080`，按需在客户端或系统中设置代理

| 项目 | 说明 |
|------|------|
| 内核要求 | 较新版本 sing-box（DNS server `type` 写法与 `http_clients` 为新格式，建议 1.12 及以上） |
| 节点来源 | 不含订阅机制，节点需手动填写或经订阅转换生成 |

---

## 四、Surfboard

**Surfboard 规则配置 —— Android 平台轻量分流模板**

### ✨ 功能

- 11 个应用策略组：AI / Apple / GitHub / Google / Microsoft / Spotify / Telegram / TikTok / TV（Netflix·Disney+·PrimeVideo·AppleMedia·HBO）/ X / YouTube
- 5 个地区自动测速组（HK / JP / TW / SG / US），隐藏不占面板，从「静态」组按正则捞取地区节点
- 广告 / 隐私跟踪域名 REJECT，国内域名 + GeoIP CN 直连，其余走主代理
- 双栈 DoH 防污染 DNS（阿里 223.5.5.5 + 腾讯 1.12.12.12），NTP / STUN / 游戏主机 / 连通性检测域名强制真实 IP
- 规则集来自 Repcz/Tool（Surge 格式），每周自动更新

### 📦 使用

1. 复制上方导入链接
2. Surfboard → 配置（Profile）→ 从 URL 导入
3. 把「静态」策略组 `policy-path` 中的 `在这里填写订阅链接` 替换为实际订阅链接（Surge 格式订阅）
4. 为各业务分组选择出口（默认主代理）

| 项目 | 说明 |
|------|------|
| 平台要求 | Android，[Surfboard](https://getsurfboard.com/) |
| 节点来源 | 本文件不含节点，仅规则模板；订阅经 `policy-path` 挂载 |

---

> 所有配置仅规则与策略框架，不含任何节点信息；导入后请确认规则集在日志中全部下载成功。

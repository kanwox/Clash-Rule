# SingBox_conf.json

sing-box 模板配置 —— 应用分流 + 地区测速 + Game/Steam 分组。

## ✨ 功能

- 8 个业务分组：AI / Apple / Google / YouTube / TV（Netflix·Disney+·Spotify）/ Game（Steam）/ Telegram，外加主代理（Proxy）与静态（Static）选择器
- 6 个地区自动测速组：HK / JP / KR / SG / TW / US（`urltest`）
- 广告与 BT（BitTorrent）流量直接拒绝，国内域名 / IP 与私网直连，其余走主代理
- DNS 分流：国外域名走 1.1.1.1 DoH（经代理出站），国内域名走 223.5.5.5 DoH（直连），fake-ip 模式；拒绝 AAAA 与 HTTPS/SVCB 查询（`ipv4_only`），广告域名拒绝解析，fake-ip 豁免清单由 `fakeip-filter` 规则集兜底
- 16 个 MetaCubeX srs 二进制规则集（`cdn.jsdmirror.com` 镜像源），每 168 小时自动更新
- `cache_file` 本地缓存持久化 fake-ip 映射与节点选择

## 📦 使用

1. 下载 `SingBox_conf.json`
2. 把 `outbounds` 中所有 `"__NODE_PLACEHOLDER__"` 替换为你的节点名（「Static」选择器与 6 个地区测速组均需替换）
3. 通过 sing-box 内核或 GUI 客户端（SFA / SFM / SFI 等）加载运行
4. 本地混合入站监听 `127.0.0.1:2080`，按需设置代理

| 项目 | 说明 |
|------|------|
| 内核要求 | 较新版本 sing-box（DNS server `type` 写法与 `http_clients` 为新格式，建议 1.12 及以上） |
| 节点来源 | 不含订阅机制，节点需手动填写或经订阅转换生成 |

> 本文件仅规则与策略框架，不含任何节点信息。

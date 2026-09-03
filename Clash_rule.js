// Clash_rule.js v5.3
// 注意：需较新的 mihomo 内核；首次启动需联网下载规则集，请在日志中确认全部下载成功。

function main(params) {
    if (!params || typeof params !== "object") params = {};
    if (!Array.isArray(params.proxies)) params.proxies = [];

    // 记录订阅自身是否使用代理集合（必须在下方覆写 rule-providers 之前读取）
    const subHasProviders = Object.keys(params["proxy-providers"] || {}).length > 0;

    const basicOptions = {
        "mixed-port": 7892,
        "allow-lan": false,
        "mode": "rule",
        "log-level": "warning",
        "unified-delay": true,
        "tcp-concurrent": true,
        "ipv6": true,
        "find-process-mode": "off",
        // TCP 保活调优：内核默认间隔仅 15s，移动端费电且长连接易被 NAT 提前掐断；
        // 300/30 为省电与响应速度的折中值
        "keep-alive-idle": 300,
        "keep-alive-interval": 30,
        "profile": {
            "store-selected": true,
            "store-fake-ip": true
        }
    };
    Object.assign(params, basicOptions);
    delete params["global-client-fingerprint"];

    params["sniffer"] = {
        "enable": true,
        "force-dns-mapping": true,
        // 对拿不到域名的纯 IP 流量强制嗅探：应用绕过系统 DNS 自行解析后直连 IP 时，
        // 从 TLS SNI / HTTP Host 还原出域名参与正常分流，避免落到 cn-ip/MATCH 兜底误判
        "parse-pure-ip": true,
        "override-destination": true,
        "sniff": {
            "HTTP": {
                "ports": [80, "8080-8880"],
                "override-destination": true
            },
            "TLS": {
                "ports": [443, 8443]
            },
            "QUIC": {
                "ports": [443, 8443]
            }
        },
        "skip-domain": [
            "Mijia Cloud",
            "+.apple.com",
            "+.openai.com",
            "+.oaistatic.com",
            "+.oaiusercontent.com",
            "+.chatgpt.com"
        ]
    };

    const excludeFilter = '(?i)(剩余|官网|套餐|流量|到期|过期|更新|刷新|订阅|群|网址|客服|欢迎|加入|Expire|Traffic|Reset|(^|[^A-Za-z0-9])(\\d+(\\.\\d+)?\\s*(GB|TB)|\\d+\\s*Days?)([^A-Za-z0-9]|$))';

    const regions = [
        {
            name: "AE",
            regex: "(?i)(阿联酋|阿聯酋|迪拜|阿布扎比|🇦🇪|(^|[^A-Za-z])UAE([^A-Za-z]|$)|Emirates|Dubai)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/ae.svg"
        },
        {
            name: "AR",
            regex: "(?i)(阿根廷|布宜诺斯艾利斯|🇦🇷|(^|[^A-Za-z])AR([^A-Za-z]|$)|(^|[^A-Za-z])ARG([^A-Za-z]|$)|Argentina)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/ar.svg"
        },
        {
            name: "AU",
            regex: "(?i)(澳大利亚|澳大利亞|澳洲|悉尼|墨尔本|墨爾本|🇦🇺|(^|[^A-Za-z])AU([^A-Za-z]|$)|(^|[^A-Za-z])AUS([^A-Za-z]|$)|Australia|Sydney|Melbourne)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/au.svg"
        },
        {
            name: "BD",
            regex: "(?i)(孟加拉|孟加拉國|达卡|達卡|🇧🇩|(^|[^A-Za-z])BD([^A-Za-z]|$)|(^|[^A-Za-z])BGD([^A-Za-z]|$)|Bangladesh|Dhaka)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/bd.svg"
        },
        {
            name: "BR",
            regex: "(?i)(巴西|圣保罗|聖保羅|🇧🇷|(^|[^A-Za-z])BR([^A-Za-z]|$)|(^|[^A-Za-z])BRA([^A-Za-z]|$)|Brazil|Brasil|SaoPaulo)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/br.svg"
        },
        {
            name: "CA",
            regex: "(?i)(加拿大|多伦多|多倫多|温哥华|溫哥華|🇨🇦|(^|[^A-Za-z])CA([^A-Za-z]|$)|(^|[^A-Za-z])CAN([^A-Za-z]|$)|Canada|Toronto|Vancouver)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/ca.svg"
        },
        {
            name: "DE",
            regex: "(?i)(德国|德國|法兰克福|法蘭克福|🇩🇪|(^|[^A-Za-z])DE([^A-Za-z]|$)|(^|[^A-Za-z])DEU([^A-Za-z]|$)|Germany|Frankfurt)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/de.svg"
        },
        {
            name: "FR",
            regex: "(?i)(法国|法國|巴黎|🇫🇷|(^|[^A-Za-z])FR([^A-Za-z]|$)|(^|[^A-Za-z])FRA([^A-Za-z]|$)|France|Paris)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/fr.svg"
        },
        {
            name: "GB",
            regex: "(?i)(英国|英國|伦敦|倫敦|🇬🇧|(^|[^A-Za-z])UK([^A-Za-z]|$)|(^|[^A-Za-z])GB([^A-Za-z]|$)|(^|[^A-Za-z])GBR([^A-Za-z]|$)|United[ -]?Kingdom|England|London)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/gb.svg"
        },
        {
            name: "HK",
            regex: "(?i)(香港|🇭🇰|(^|[^A-Za-z])HK([^A-Za-z]|$)|(^|[^A-Za-z])HKG([^A-Za-z]|$)|Hong[ -]?Kong)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/hk.svg"
        },
        {
            name: "ID",
            regex: "(?i)(印度尼西亚|印度尼西亞|印尼|雅加达|雅加達|🇮🇩|Indonesia|Jakarta|(?:^|[|/·?][ ]*)ID(?:[ ]*(?:[|/_·?-]|[0-9])|$)|(?:^|[^A-Za-z0-9])IDN(?:[^A-Za-z]|$))",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/id.svg"
        },
        {
            name: "IN",
            regex: "(?i)(印度([^尼]|$)|新德里|孟买|孟買|班加罗尔|班加羅爾|🇮🇳|(^|[^A-Za-z])India([^A-Za-z]|$)|Mumbai|Delhi|Bangalore|(^|[^A-Za-z])IN([^A-Za-z]|$)|(^|[^A-Za-z])IND([^A-Za-z]|$))",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/in.svg"
        },
        {
            name: "JP",
            regex: "(?i)(日本|东京|東京|大阪|🇯🇵|(^|[^A-Za-z])JP([^A-Za-z]|$)|(^|[^A-Za-z])JPN([^A-Za-z]|$)|Japan)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/jp.svg"
        },
        {
            name: "KR",
            regex: "(?i)(韩国|韓国|南韩|南韓|首尔|首爾|🇰🇷|(^|[^A-Za-z])KR([^A-Za-z]|$)|(^|[^A-Za-z])KOR([^A-Za-z]|$)|Korea)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/kr.svg"
        },
        {
            name: "MY",
            regex: "(?i)(马来西亚|馬來西亞|吉隆坡|🇲🇾|(^|[^A-Za-z])MY([^A-Za-z]|$)|(^|[^A-Za-z])MYS([^A-Za-z]|$)|Malaysia)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/my.svg"
        },
        {
            name: "NL",
            regex: "(?i)(荷兰|荷蘭|阿姆斯特丹|🇳🇱|(^|[^A-Za-z])NL([^A-Za-z]|$)|(^|[^A-Za-z])NLD([^A-Za-z]|$)|Netherlands|Amsterdam)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/nl.svg"
        },
        {
            name: "PH",
            regex: "(?i)(菲律宾|菲律賓|马尼拉|馬尼拉|宿务|宿霧|🇵🇭|(^|[^A-Za-z])PH([^A-Za-z]|$)|(^|[^A-Za-z])PHL([^A-Za-z]|$)|Philippines|Manila|Cebu)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/ph.svg"
        },
        {
            name: "SG",
            regex: "(?i)(新加坡|狮城|獅城|🇸🇬|(^|[^A-Za-z])SG([^A-Za-z]|$)|(^|[^A-Za-z])SGP([^A-Za-z]|$)|Singapore)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/sg.svg"
        },
        {
            name: "TH",
            regex: "(?i)(泰国|泰國|曼谷|🇹🇭|Thailand|Bangkok|(^|[^A-Za-z])TH([^A-Za-z]|$)|(^|[^A-Za-z])THA([^A-Za-z]|$))",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/th.svg"
        },
        {
            name: "TR",
            regex: "(?i)(土耳其|伊斯坦布尔|🇹🇷|(^|[^A-Za-z])TR([^A-Za-z]|$)|(^|[^A-Za-z])TUR([^A-Za-z]|$)|Turkey|Türkiye|Istanbul)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/tr.svg"
        },
        {
            name: "TW",
            regex: "(?i)(台湾|台灣|台北|新北|🇹🇼|(^|[^A-Za-z])TW([^A-Za-z]|$)|(^|[^A-Za-z])TWN([^A-Za-z]|$)|Taiwan)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/tw.svg"
        },
        {
            name: "US",
            regex: "(?i)(美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|硅谷|矽谷|西雅图|西雅圖|纽约|紐約|🇺🇸|(^|[^A-Za-z])US([^A-Za-z]|$)|(^|[^A-Za-z])USA([^A-Za-z]|$)|United[ -]?States)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/us.svg"
        },
        {
            name: "VN",
            regex: "(?i)(越南|河内|河內|胡志明|🇻🇳|(^|[^A-Za-z])VN([^A-Za-z]|$)|(^|[^A-Za-z])VNM([^A-Za-z]|$)|Viet[ -]?Nam|Hanoi|Ho[ -]?Chi[ -]?Minh)",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/vn.svg"
        }
    ];

    const toJsRegex = goStyleRegex => new RegExp(goStyleRegex.replace(/^\(\?i\)/, ""), "i");
    const allProxies = (params.proxies || []).filter(proxy => proxy && proxy.type !== "direct");
    const excludeRe = toJsRegex(excludeFilter);

    const threshold = 2;
    const matchedRegions = regions.filter(region => {
        const regex = toJsRegex(region.regex);
        let count = 0;
        for (const proxy of allProxies) {
            if (proxy && proxy.name && regex.test(proxy.name) && !excludeRe.test(proxy.name)) {
                count++;if (count >= threshold) return true;
            }
        }
        return false;
    });

    // 订阅使用代理集合时无法在脚本期得知节点内容，维持全量地区组；
    // 普通节点列表则按“同地区 ≥2 个节点”动态建组
    const activeRegions = subHasProviders ? regions : matchedRegions;
    const hasActiveRegions = activeRegions.length > 0;

    const subDNS = params.dns || {};

    // ── 订阅 DNS 悬空引用清洗 ──
    // 本脚本会整体重建 rule-providers 与全部策略组，订阅自带配置里指向它们的
    // rule-set:/geosite: 引用和 "#某组名" 后缀若原样并入，内核会因找不到目标而报错。
    // geosite: 引用还会触发内核额外下载 geo 文件，与本脚本无 geo 数据的设计冲突。
    // （脚本自己的 rule-set 引用在下方独立写入，不受此清洗影响）
    // 本脚本固定生成的组名（App 组名需与下方 apps 数组保持同步）
    const OWN_GROUPS = ["主代理", "静态", "直连", "AI", "Apple", "GitHub", "Google", "Microsoft",
                        "Spotify", "Telegram", "TikTok", "TV", "Twitch", "X", "YouTube"];
    // 内建策略
    const BUILTIN_POLICIES = new Set(["DIRECT", "REJECT", "REJECT-DROP", "PASS", "GLOBAL"]);
    // 地区组名：不用写死的全量地区码表，改为从上面已经算好的 activeRegions（实际会建组的地区）
    // 动态生成，避免"引用了一个因节点不足而未实际建组的地区"导致内核找不到目标策略组而崩溃
    const REGION_NAMES = new Set(activeRegions.map(region => region.name));
    // 校验 DNS 条目尾部 "#目标" 后缀：合法则整条保留，
    // 无效（指向已被删除的组）则剥掉、该条 DNS 回落直连（安全默认）
    const refValid = ref => BUILTIN_POLICIES.has(ref)
        || OWN_GROUPS.indexOf(ref) !== -1
        || REGION_NAMES.has(ref);
    const stripDanglingRef = entry => {
        const s = String(entry);
        const hash = s.indexOf("#");
        if (hash === -1) return s;
        return refValid(s.slice(hash + 1).split("&")[0].trim()) ? s : s.slice(0, hash);
    };

    const subPSN = [].concat(subDNS["proxy-server-nameserver"] || []).map(stripDanglingRef);
    const subNS = [].concat(subDNS["nameserver"] || []).map(stripDanglingRef);
    const subPolicy = Object.assign({}, subDNS["nameserver-policy"] || {});
    const subFilter = [].concat(subDNS["fake-ip-filter"] || []).filter(item =>
        !/^(rule-set|geosite):/i.test(String(item))
    );

    for (const k of Object.keys(subPolicy)) {
        if (k === "+." || k === "*" || k === "+") { delete subPolicy[k]; continue; }    // 通吃键架空分流，丢弃
        if (/^(rule-set|geosite):/i.test(k)) { delete subPolicy[k]; continue; }         // 指向已重建的规则集，丢弃
        subPolicy[k] = [].concat(subPolicy[k]).map(stripDanglingRef);                   // 值里的 "#组名" 悬空引用同样清洗
    }

    params["dns"] = {
        "enable": true,
        "listen": "127.0.0.1:1053",
        "ipv6": false, // 关闭 DNS 层 IPv6（与顶层 ipv6 无关），避免下发 fake-ip6 被 Chrome 误判成局域网地址而拦截
        "prefer-h3": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        // IPv6 fake-ip 段：官方示例的文档专用段；勿改用 fc00::/7 等内网保留地址，避免与真实局域网冲突
        "fake-ip-range6": "fdfe:dcba:9876::/64",
        "cache-algorithm": "arc",
        // 保留订阅自带的 hosts 能力
        "use-hosts": subDNS["use-hosts"] !== undefined ? subDNS["use-hosts"] : true,
        "use-system-hosts": subDNS["use-system-hosts"] !== undefined ? subDNS["use-system-hosts"] : true,
        ...(subDNS.hosts ? { "hosts": subDNS.hosts } : {}),
        "fake-ip-filter": [
            ...new Set([
                "+.lan",
                "+.local",
                "localhost.ptlogin2.qq.com",
                "+.msftconnecttest.com",
                "+.msftncsi.com",
                "+.ntp.org",
                "+.xboxlive.com",
                "+.playstation.net",
                "+.xbox.com",
                "xbox.ipv6.microsoft.com",
                "+.srv.nintendo.net",
                // 系统对时域名，拿假地址会导致对时失败进而影响 TLS 校验
                "time.windows.com",
                "time.apple.com",
                // STUN 通配兜底：域名中含 stun 段的全部豁免假地址
                "+.stun.*",
                "+.stun.*.*",
                "+.stun.*.*.*",
                "+.stun.*.*.*.*",
                "rule-set:cn-domain",
                "rule-set:private-domain",
                // 社区维护的 fake-ip 豁免清单兜底（连通性检测/NTP/STUN/游戏主机等），防手维护清单漏项
                "rule-set:fakeip-filter",
                ...subFilter
            ])
        ],
        // 引导 DNS：仅用于解析其它 DoH 服务器的域名，明文 IP 最快且不依赖证书校验
        // （DoT 在设备时钟不准时会因证书校验失败而失效）
        "default-nameserver": [
            "223.5.5.5",
            "119.29.29.29"
        ],
        // 机场优先、独占不混用：机场指定了节点解析 DNS 就只用机场的，
        // 避免公共 DNS 并发抢答把专线隐蔽域名解析成错误的落地 IP；机场没指定才用国内 DoH 兜底
        "proxy-server-nameserver": subPSN.length > 0
            ? [...new Set(subPSN)]
            : [
                "https://223.5.5.5/dns-query",
                "https://doh.pub/dns-query"
            ],
        // 主解析同理：机场指定了 DNS 就独占使用；否则用规则默认（走主代理隧道查询）兜底
        "nameserver": subNS.length > 0
            ? [...new Set(subNS)]
            : [
                "https://1.1.1.1/dns-query#主代理",
                "https://8.8.8.8/dns-query#主代理"
            ],
        // 规则命中 DIRECT 但未被下方 nameserver-policy 单独覆盖的域名（例如未收录进
        // cn-domain 分类的冷门国内站点，配合下方 cn-ip 规则去掉 no-resolve 后需要真实解析）
        // 用国内 DNS 解析，避免退回 nameserver 走主代理查询海外 DNS，导致解析慢、拿错境外 CDN IP
        // 用纯 IP 而非 DoH：该字段用 DoH 时有部分环境会反复回退到 default-nameserver 重复解析、拖高延迟
        "direct-nameserver": [
            "223.5.5.5",
            "119.29.29.29"
        ],
        // 仅当 direct-nameserver 未覆盖时才回退到 nameserver-policy，
        // 保证 private-domain/ads-domain/cn-domain 现有的针对性覆盖仍优先生效
        "direct-nameserver-follow-policy": true,
        "nameserver-policy": Object.assign({}, subPolicy, {
            "rule-set:private-domain": [
                "system://"
            ],
            "rule-set:ads-domain": [
                "rcode://name_error"
            ],
            "rule-set:cn-domain": [
                "https://223.5.5.5/dns-query",
                "https://doh.pub/dns-query"
            ]
        })
    };

    // 远程规则集：MetaCubeX 官方拆分库，全 mrs，默认更新周期一个月（2592000 秒）
    const RS_BASE = "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo";
    const domainProvider = (name, interval = 2592000) => ({
        "type": "http",
        "behavior": "domain",
        "format": "mrs",
        "url": `${RS_BASE}/geosite/${name}.mrs`,
        "path": `./ruleset/geosite-${name}.mrs`,
        "interval": interval
    });
    const ipProvider = name => ({
        "type": "http",
        "behavior": "ipcidr",
        "format": "mrs",
        "url": `${RS_BASE}/geoip/${name}.mrs`,
        "path": `./ruleset/geoip-${name}.mrs`,
        "interval": 2592000
    });
    // 引用名 → 官方分类名
    const DOMAIN_SETS = {
        "private-domain": "private",
        "ads-domain": "category-ads-all",
        "youtube-domain": "youtube",
        "twitch-domain": "twitch",
        "twitter-domain": "twitter",
        "tiktok-domain": "tiktok",
        "telegram-domain": "telegram",
        "github-domain": "github",
        "ai-domain": "category-ai-!cn",
        "netflix-domain": "netflix",
        "disney-domain": "disney",
        "primevideo-domain": "primevideo",
        "appletv-domain": "apple-tvplus",
        "hbo-domain": "hbo",
        "spotify-domain": "spotify",
        "google-domain": "google",
        "apple-domain": "apple",
        "microsoft-domain": "microsoft",
        "cn-domain": "cn"
    };
    const IP_SETS = {
        "private-ip": "private",
        "telegram-ip": "telegram",
        "cn-ip": "cn"
    };
    params["rule-providers"] = {};
    Object.keys(DOMAIN_SETS).forEach(key => {
        // 广告域名时效性最强，单独周更（7 天）；其余分类变化慢，维持月更
        params["rule-providers"][key] = key === "ads-domain"
            ? domainProvider(DOMAIN_SETS[key], 604800)
            : domainProvider(DOMAIN_SETS[key]);
    });
    Object.keys(IP_SETS).forEach(key => {
        params["rule-providers"][key] = ipProvider(IP_SETS[key]);
    });
    // 社区维护的 fake-ip 豁免清单（wwqgtxx/clash-rules，独立来源），
    // 供上方 dns.fake-ip-filter 以 rule-set:fakeip-filter 引用
    params["rule-providers"]["fakeip-filter"] = {
        "type": "http",
        "behavior": "domain",
        "format": "mrs",
        "url": "https://testingcf.jsdelivr.net/gh/wwqgtxx/clash-rules@release/fakeip-filter.mrs",
        "path": "./ruleset/fakeip-filter.mrs",
        "interval": 2592000
    };

    const FP_OK = ["vless", "vmess", "trojan"];
    (params.proxies || []).forEach(proxy => {
        if (!proxy) return;
        if (proxy.type !== "direct" && !("ip-version" in proxy)) proxy["ip-version"] = "ipv4-prefer";
        if (FP_OK.indexOf(proxy.type) !== -1 && !proxy["client-fingerprint"]) {
            const usesTLS = proxy.type === "trojan" || proxy.tls === true || proxy["reality-opts"];
            if (usesTLS) proxy["client-fingerprint"] = "chrome";
        }
    });

    Object.values(params["proxy-providers"] || {}).forEach(provider => {
        if (provider && typeof provider === "object") {
            provider.override = Object.assign({}, provider.override || {}, {
                "ip-version": "ipv4-prefer",
                "override-expr": [
                    ...(((provider.override || {})["override-expr"]) || []),
                    '(select(.type == "trojan" or ((.type == "vless" or .type == "vmess") and (.tls == true or has("reality-opts")))) | select(has("client-fingerprint") | not) | .client-fingerprint) = "chrome"'
                ]
            });
        }
    });

    let groups = [];

    //主代理
    groups.push({
        name: "主代理",
        type: "select",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Proxy.png",
        proxies: hasActiveRegions
            ? [...activeRegions.map(region => `${region.name}`), "静态", "直连"]
            : ["静态", "直连"]
    });

    // 静态
    groups.push({
        name: "静态",
        type: "select",
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Static.png",
        "include-all": true,
        "exclude-type": "direct",
        "exclude-filter": excludeFilter,
        "empty-fallback": "REJECT"
    });

    // 隐藏直连测速组：主面板不展示卡片，仅供内部选择和走国内测速
    groups.push({
        name: "直连",
        type: "select",
        hidden: true,
        icon: "https://testingcf.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Direct.png",
        proxies: ["DIRECT"],
        url: "http://connect.rom.miui.com/generate_204"
    });

    // App策略组
    const appProxiesList = [
        "主代理",
        "直连",
        ...activeRegions.map(region => `${region.name}`)
    ];

    const apps = [
        { name: "AI",icon: "openai.png" },
        { name: "Apple",     icon: "apple.png" },
        { name: "GitHub",    icon: "https://i.postimg.cc/vTSTYrLQ/github.png" },
        { name: "Google",    icon: "google.png" },
        { name: "Microsoft", icon: "microsoft.png" },
        { name: "Spotify",   icon: "spotify.png" },
        { name: "Telegram",  icon: "telegram.png" },
        { name: "TikTok",    icon: "tiktok.png" },
        { name: "TV",        icon: "netflix.png" },
        { name: "Twitch",    icon: "twitch.png" },
        { name: "X",         icon: "x.png" },
        { name: "YouTube",   icon: "youtube.png" }
    ];

    apps.forEach(app => {
        const icon = app.icon.startsWith("http")
            ? app.icon
            : `https://testingcf.jsdelivr.net/gh/shindgew/WHATSINStash@main/icon/${app.icon}`;

        groups.push({
            name: app.name,
            type: "select",
            icon: icon,
            proxies: appProxiesList,
            "include-all": true,
            "exclude-type": "direct",
            "exclude-filter": excludeFilter
        });
    });

    // 国家测速组（全隐藏）
    activeRegions.forEach(region => {
        groups.push({
            name: `${region.name}`,
            type: "url-test",
            hidden: true,
            icon: region.icon,
            "include-all": true,
            "exclude-type": "direct",
            "filter": region.regex,
            "exclude-filter": excludeFilter,
            "empty-fallback": "REJECT",
            "url": "https://www.gstatic.com/generate_204",
            "interval": 300,
            "tolerance": 30,
            "lazy": true,
            "timeout": 5000,
            "max-failed-times": 5,
            "expected-status": 204
        });
    });

    params["proxy-groups"] = groups;

    params["rules"] = [
        "RULE-SET,private-domain,DIRECT",
        "RULE-SET,private-ip,DIRECT,no-resolve",
        "RULE-SET,ads-domain,REJECT",
        // 系统对时属于基础功能，优先于业务分流；很多代理节点会丢弃/限制 UDP 123，
        // 时间偏差过大会连带导致全局 HTTPS/TLS 证书校验失败
        "AND,((DST-PORT,123),(NETWORK,udp)),DIRECT",

        "RULE-SET,youtube-domain,YouTube",
        "RULE-SET,twitch-domain,Twitch",
        "RULE-SET,twitter-domain,X",
        "RULE-SET,tiktok-domain,TikTok",
        "RULE-SET,telegram-domain,Telegram",
        "RULE-SET,telegram-ip,Telegram,no-resolve",
        "RULE-SET,ai-domain,AI",
        "RULE-SET,github-domain,GitHub",

        "RULE-SET,netflix-domain,TV",
        "RULE-SET,disney-domain,TV",
        "RULE-SET,primevideo-domain,TV",
        "RULE-SET,appletv-domain,TV",
        "RULE-SET,hbo-domain,TV",
        "RULE-SET,spotify-domain,Spotify",

        "RULE-SET,google-domain,Google",
        "RULE-SET,apple-domain,Apple",
        "RULE-SET,microsoft-domain,Microsoft",

        "RULE-SET,cn-domain,DIRECT",
        // 去掉 no-resolve：配合上方 dns.direct-nameserver，让未被 cn-domain 收录的冷门
        // 国内站点也能在命中该规则前完成真实 IP 解析、判断是否落在境内网段
        "RULE-SET,cn-ip,DIRECT",

        "MATCH,主代理"
    ];

    return params;
}

if (typeof module !== "undefined") {
    module.exports = main;
    module.exports.main = main;
}

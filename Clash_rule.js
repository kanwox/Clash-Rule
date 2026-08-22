// Clash_rule.js v5.1
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
        "parse-pure-ip": false,
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

    const subDNS = params.dns || {};
    const subPSN = [].concat(subDNS["proxy-server-nameserver"] || []);
    const subNS = [].concat(subDNS["nameserver"] || []);
    const subPolicy = Object.assign({}, subDNS["nameserver-policy"] || {});
    const subFilter = [].concat(subDNS["fake-ip-filter"] || []);

    for (const k of Object.keys(subPolicy)) {
        if (k === "+." || k === "*" || k === "+") delete subPolicy[k];
    }

    params["dns"] = {
        "enable": true,
        "listen": "127.0.0.1:1053",
        "ipv6": false, // 关闭 DNS 层 IPv6（与顶层 ipv6 无关），避免下发 fake-ip6 被 Chrome 误判成局域网地址而拦截
        "prefer-h3": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-range6": "fc00::/16",
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
                ...subFilter
            ])
        ],
        "default-nameserver": [
            "tls://223.5.5.5",
            "tls://119.29.29.29"
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

    // 远程规则集：MetaCubeX 官方拆分库，全 mrs，更新周期一个月（2592000 秒）
    const RS_BASE = "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo";
    const domainProvider = name => ({
        "type": "http",
        "behavior": "domain",
        "format": "mrs",
        "url": `${RS_BASE}/geosite/${name}.mrs`,
        "path": `./ruleset/geosite-${name}.mrs`,
        "interval": 2592000
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
        params["rule-providers"][key] = domainProvider(DOMAIN_SETS[key]);
    });
    Object.keys(IP_SETS).forEach(key => {
        params["rule-providers"][key] = ipProvider(IP_SETS[key]);
    });

    const FP_OK = ["vless", "vmess", "trojan"];
    (params.proxies || []).forEach(proxy => {
        if (!proxy) return;
        if (proxy.type !== "direct" && !("ip-version" in proxy)) proxy["ip-version"] = "ipv4-prefer";
        if (FP_OK.indexOf(proxy.type) !== -1 && !proxy["client-fingerprint"]) {
            const usesTLS = proxy.type === "trojan" || proxy.tls === true || proxy["reality-opts"];
            if (usesTLS) proxy["client-fingerprint"] = "chrome";
        }
        if (proxy["reality-opts"] && !("support-x25519mlkem768" in proxy["reality-opts"])) {
            proxy["reality-opts"]["support-x25519mlkem768"] = true;
        }});

    Object.values(params["proxy-providers"] || {}).forEach(provider => {
        if (provider && typeof provider === "object") {
            provider.override = Object.assign({}, provider.override || {}, {
                "ip-version": "ipv4-prefer",
                "override-expr": [
                    ...(((provider.override || {})["override-expr"]) || []),
                    '(select(.type == "trojan" or ((.type == "vless" or .type == "vmess") and (.tls == true or has("reality-opts")))) | select(has("client-fingerprint") | not) | .client-fingerprint) = "chrome"',
                    '(select(has("reality-opts")) | select(.reality-opts | has("support-x25519mlkem768") | not) | .reality-opts.support-x25519mlkem768) = true'
                ]
            });
        }
    });

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
            regex: "(?i)(印度([^尼]|$)|新德里|孟买|孟買|班加罗尔|班加羅爾|🇮🇳|(^|[^A-Za-z])India([^A-Za-z]|$)|Mumbai|Delhi|Bangalore|(?:^|[^A-Za-z0-9])(?:IN|IND)(?:[^A-Za-z]|$))",
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
            regex: "(?i)(泰国|泰國|曼谷|🇹🇭|Thailand|Bangkok|(?:^|[^A-Za-z0-9])(?:TH|THA)(?:[^A-Za-z]|$))",
            icon: "https://testingcf.jsdelivr.net/gh/HatScripts/circle-flags@gh-pages/flags/th.svg"
        },
        {
            name: "TR",
            regex: "(?i)(土耳其|伊斯坦布尔|🇹🇷|Turkey|Türkiye|Istanbul)",
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
    // 普通节点列表则按“同地区 ≥2 个节点”动态建组（恢复原语义）
    const activeRegions = subHasProviders ? regions : matchedRegions;
    const hasActiveRegions = activeRegions.length > 0;

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
        "DOMAIN-SUFFIX,max.com,TV",
        "RULE-SET,hbo-domain,TV",

        "RULE-SET,google-domain,Google",
        "RULE-SET,apple-domain,Apple",
        "RULE-SET,microsoft-domain,Microsoft",

        "RULE-SET,cn-domain,DIRECT",
        "RULE-SET,cn-ip,DIRECT,no-resolve",

        "MATCH,主代理"
    ];

    return params;
}

if (typeof module !== "undefined") {
    module.exports = main;
    module.exports.main = main;
}
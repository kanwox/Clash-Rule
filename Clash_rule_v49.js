function main(params) {
    if (!params || typeof params !== "object") params = {};
    if (!Array.isArray(params.proxies)) params.proxies = [];

    const basicOptions = {
        "mixed-port": 7892,
        "allow-lan": false,
        "mode": "rule",
        "log-level": "warning",
        "unified-delay": true,
        "tcp-concurrent": true,
        "geodata-mode": true,
        "geo-auto-update": true,
        "geo-update-interval": 720,
        "geox-url": {
            "geoip": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat",
            "geosite": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat",
            "mmdb": "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb"
        },
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
            "+.push.apple.com",
            "+.apple.com",
            "+.openai.com",
            "+.oaistatic.com",
            "+.oaiusercontent.com",
            "+.chatgpt.com"
        ]
    };

    const subDNS = params.dns || {};
    const subPSN = [].concat(subDNS["proxy-server-nameserver"] || []);
    const subPolicy = Object.assign({}, subDNS["nameserver-policy"] || {});
    const subFilter = [].concat(subDNS["fake-ip-filter"] || []);

    for (const k of Object.keys(subPolicy)) {
        if (k === "+." || k === "*" || k === "+") delete subPolicy[k];
    }

    params["dns"] = {
        "enable": true,
        "listen": "127.0.0.1:1053",
        "ipv6": true,
        "prefer-h3": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-range6": "fc00::/16",
        "cache-algorithm": "arc",
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
                "+.battlenet.com.cn",
                "geosite:cn",
                "geosite:private",
                ...subFilter
            ])
        ],
        "default-nameserver": [
            "223.5.5.5",
            "119.29.29.29"
        ],
        "proxy-server-nameserver": [
            ...new Set([
                ...subPSN,
                "https://223.5.5.5/dns-query",
                "https://doh.pub/dns-query",
                "https://1.1.1.1/dns-query"
            ])
        ],
        "nameserver": [
            "https://1.1.1.1/dns-query#主代理",
            "https://8.8.8.8/dns-query#主代理"
        ],
        "nameserver-policy": Object.assign({}, subPolicy, {
            "geosite:private": [
                "system://"
            ],
            "geosite:category-ads-all": [
                "rcode://name_error"
            ],
            "geosite:cn": [
                "https://223.5.5.5/dns-query",
                "https://doh.pub/dns-query"
            ]
        })
    };

    const FP_OK = ["vless", "vmess", "trojan"];
    (params.proxies || []).forEach(proxy => {
        if (!proxy) return;
        if (proxy.type !== "direct") proxy["ip-version"] = "ipv4-prefer";
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
                "ip-version": "ipv4-prefer"
            });
        }
    });

    const excludeFilter = '(?i)(剩余|官网|套餐|流量|到期|过期|更新|刷新|订阅|群|网址|客服|欢迎|加入|Expire|Traffic|Reset|(^|[^A-Za-z0-9])(\\d+(\\.\\d+)?\\s*(GB|TB)|\\d+\\s*Days?)([^A-Za-z0-9]|$))';

    const regions = [
        {
            name: "AE",
            regex: "(?i)(阿联酋|阿聯酋|迪拜|阿布扎比|🇦🇪|(^|[^A-Za-z])UAE([^A-Za-z]|$)|Emirates|Dubai)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/ae.svg"
        },
        {
            name: "AR",
            regex: "(?i)(阿根廷|布宜诺斯艾利斯|🇦🇷|(^|[^A-Za-z])AR([^A-Za-z]|$)|(^|[^A-Za-z])ARG([^A-Za-z]|$)|Argentina)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/ar.svg"
        },
        {
            name: "AU",
            regex: "(?i)(澳大利亚|澳大利亞|澳洲|悉尼|墨尔本|墨爾本|🇦🇺|(^|[^A-Za-z])AU([^A-Za-z]|$)|(^|[^A-Za-z])AUS([^A-Za-z]|$)|Australia|Sydney|Melbourne)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/au.svg"
        },
        {
            name: "BD",
            regex: "(?i)(孟加拉|孟加拉國|达卡|達卡|🇧🇩|(^|[^A-Za-z])BD([^A-Za-z]|$)|(^|[^A-Za-z])BGD([^A-Za-z]|$)|Bangladesh|Dhaka)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/bd.svg"
        },
        {
            name: "BR",
            regex: "(?i)(巴西|圣保罗|聖保羅|🇧🇷|(^|[^A-Za-z])BR([^A-Za-z]|$)|(^|[^A-Za-z])BRA([^A-Za-z]|$)|Brazil|Brasil|SaoPaulo)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/br.svg"
        },
        {
            name: "CA",
            regex: "(?i)(加拿大|多伦多|多倫多|温哥华|溫哥華|🇨🇦|(^|[^A-Za-z])CA([^A-Za-z]|$)|(^|[^A-Za-z])CAN([^A-Za-z]|$)|Canada|Toronto|Vancouver)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/ca.svg"
        },
        {
            name: "DE",
            regex: "(?i)(德国|德國|法兰克福|法蘭克福|🇩🇪|(^|[^A-Za-z])DE([^A-Za-z]|$)|(^|[^A-Za-z])DEU([^A-Za-z]|$)|Germany|Frankfurt)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/de.svg"
        },
        {
            name: "FR",
            regex: "(?i)(法国|法國|巴黎|🇫🇷|(^|[^A-Za-z])FR([^A-Za-z]|$)|(^|[^A-Za-z])FRA([^A-Za-z]|$)|France|Paris)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/fr.svg"
        },
        {
            name: "GB",
            regex: "(?i)(英国|英國|伦敦|倫敦|🇬🇧|(^|[^A-Za-z])UK([^A-Za-z]|$)|(^|[^A-Za-z])GB([^A-Za-z]|$)|(^|[^A-Za-z])GBR([^A-Za-z]|$)|United[ -]?Kingdom|England|London)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/gb.svg"
        },
        {
            name: "HK",
            regex: "(?i)(香港|🇭🇰|(^|[^A-Za-z])HK([^A-Za-z]|$)|(^|[^A-Za-z])HKG([^A-Za-z]|$)|Hong[ -]?Kong)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/hk.svg"
        },
        {
            name: "ID",
            regex: "(?i)(印度尼西亚|印度尼西亞|印尼|雅加达|雅加達|🇮🇩|Indonesia|Jakarta|(?:^|[|/·?][ ]*)ID(?:[ ]*(?:[|/_·?-]|[0-9])|$)|(?:^|[^A-Za-z0-9])IDN(?:[^A-Za-z]|$))",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/id.svg"
        },
        {
            name: "IN",
            regex: "(?i)(印度([^尼]|$)|新德里|孟买|孟買|班加罗尔|班加羅爾|🇮🇳|(^|[^A-Za-z])India([^A-Za-z]|$)|Mumbai|Delhi|Bangalore|(?:^|[^A-Za-z0-9])(?:IN|IND)(?:[^A-Za-z]|$))",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/in.svg"
        },
        {
            name: "JP",
            regex: "(?i)(日本|东京|東京|大阪|🇯🇵|(^|[^A-Za-z])JP([^A-Za-z]|$)|(^|[^A-Za-z])JPN([^A-Za-z]|$)|Japan)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/jp.svg"
        },
        {
            name: "KR",
            regex: "(?i)(韩国|韓国|南韩|南韓|首尔|首爾|🇰🇷|(^|[^A-Za-z])KR([^A-Za-z]|$)|(^|[^A-Za-z])KOR([^A-Za-z]|$)|Korea)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/kr.svg"
        },
        {
            name: "MY",
            regex: "(?i)(马来西亚|馬來西亞|吉隆坡|🇲🇾|(^|[^A-Za-z])MY([^A-Za-z]|$)|(^|[^A-Za-z])MYS([^A-Za-z]|$)|Malaysia)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/my.svg"
        },
        {
            name: "NL",
            regex: "(?i)(荷兰|荷蘭|阿姆斯特丹|🇳🇱|(^|[^A-Za-z])NL([^A-Za-z]|$)|(^|[^A-Za-z])NLD([^A-Za-z]|$)|Netherlands|Amsterdam)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/nl.svg"
        },
        {
            name: "PH",
            regex: "(?i)(菲律宾|菲律賓|马尼拉|馬尼拉|宿务|宿霧|🇵🇭|(^|[^A-Za-z])PH([^A-Za-z]|$)|(^|[^A-Za-z])PHL([^A-Za-z]|$)|Philippines|Manila|Cebu)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/ph.svg"
        },
        {
            name: "SG",
            regex: "(?i)(新加坡|狮城|獅城|🇸🇬|(^|[^A-Za-z])SG([^A-Za-z]|$)|(^|[^A-Za-z])SGP([^A-Za-z]|$)|Singapore)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/sg.svg"
        },
        {
            name: "TH",
            regex: "(?i)(泰国|泰國|曼谷|🇹🇭|Thailand|Bangkok|(?:^|[^A-Za-z0-9])(?:TH|THA)(?:[^A-Za-z]|$))",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/th.svg"
        },
        {
            name: "TR",
            regex: "(?i)(土耳其|伊斯坦布尔|🇹🇷|Turkey|Türkiye|Istanbul)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tr.svg"
        },
        {
            name: "TW",
            regex: "(?i)(台湾|台灣|台北|新北|🇹🇼|(^|[^A-Za-z])TW([^A-Za-z]|$)|(^|[^A-Za-z])TWN([^A-Za-z]|$)|Taiwan)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tw.svg"
        },
        {
            name: "US",
            regex: "(?i)(美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|硅谷|矽谷|西雅图|西雅圖|纽约|紐約|🇺🇸|(^|[^A-Za-z])US([^A-Za-z]|$)|(^|[^A-Za-z])USA([^A-Za-z]|$)|United[ -]?States)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/us.svg"
        },
        {
            name: "VN",
            regex: "(?i)(越南|河内|河內|胡志明|🇻🇳|(^|[^A-Za-z])VN([^A-Za-z]|$)|(^|[^A-Za-z])VNM([^A-Za-z]|$)|Viet[ -]?Nam|Hanoi|Ho[ -]?Chi[ -]?Minh)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/vn.svg"
        }
    ];

    const toJsRegex = goStyleRegex => new RegExp(goStyleRegex.replace(/^\(\?i\)/, ""), "i");
    const allProxies = (params.proxies || []).filter(proxy => proxy && proxy.type !== "direct");
    const hasProxyProviders = Object.keys(params["proxy-providers"] || {}).length > 0;
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

    const activeRegions = hasProxyProviders ? regions : matchedRegions;
    const hasActiveRegions = activeRegions.length > 0;

    let groups = [];

    //主代理
    groups.push({
        name: "主代理",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Proxy.png",
        proxies: hasActiveRegions
            ? ["自动", "静态", "直连"]
            : ["静态", "直连"]
    });

    // 自动
    if (hasActiveRegions) {
        groups.push({
            name: "自动",
            type: "select",
            icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Auto.png",
            proxies: activeRegions.map(region => `${region.name} 自动`)
        });
    }

    // 静态
    groups.push({
        name: "静态",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Static.png",
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
        ...activeRegions.map(region => `${region.name} 自动`)
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
            : `https://fastly.jsdelivr.net/gh/shindgew/WHATSINStash@main/icon/${app.icon}`;

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
            name: `${region.name} 自动`,
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
    delete params["rule-providers"];

    params["rules"] = [
        "GEOSITE,private,DIRECT",
        "GEOIP,private,DIRECT,no-resolve",
        "GEOSITE,category-ads-all,REJECT",

        "GEOSITE,youtube,YouTube",
        "GEOSITE,twitch,Twitch",
        "GEOSITE,twitter,X",
        "GEOSITE,tiktok,TikTok",
        "GEOSITE,telegram,Telegram",
        "GEOIP,telegram,Telegram,no-resolve",
        "GEOSITE,category-ai-!cn,AI",
        "GEOSITE,github,GitHub",

        "GEOSITE,netflix,TV",
        "GEOSITE,disney,TV",
        "GEOSITE,primevideo,TV",
        "GEOSITE,apple-tvplus,TV",
        "DOMAIN-SUFFIX,max.com,TV",
        "GEOSITE,hbo,TV",

        "GEOSITE,google,Google",
        "GEOSITE,apple,Apple",
        "GEOSITE,microsoft,Microsoft",

        "GEOSITE,cn,DIRECT",
        "GEOIP,cn,DIRECT,no-resolve",

        "MATCH,主代理"
    ];

    return params;
}

if (typeof module !== "undefined") {
    module.exports = main;
    module.exports.main = main;
}

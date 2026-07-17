function main(params) {
    const basicOptions = {
        "mixed-port": 7892,
        "allow-lan": false,
        "mode": "rule",
        "log-level": "info",
        "unified-delay": true,
        "tcp-concurrent": true,
        "geodata-mode": true,
        "geo-auto-update": false,
        "ipv6": false,
        "find-process-mode": "off",
        "profile": {
            "store-selected": true,
            "store-fake-ip": true
        }
    };
    Object.assign(params, basicOptions);

    params["sniffer"] = {
        "enable": true,
        "sniff": {
            "HTTP": { "ports": ["80", "8080-8880"], "override-destination": true },
            "TLS": { "ports": ["443", "8443"] },
            "QUIC": { "ports": ["443", "8443"] }
        },
        "skip-domain": [ "Mijia Cloud", "+.push.apple.com" ]
    };

    params["dns"] = {
        "enable": true,
        "listen": "127.0.0.1:1053",
        "ipv6": false,
        "prefer-h3": true,
        "use-hosts": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter": [
            "*.lan", "*.local", "localhost.ptlogin2.qq.com", "+.msftconnecttest.com",
            "+.msftncsi.com", "*stun*", "*.ntp.org", "+.xboxlive.com",
            "+.playstation.net", "xbox.*.microsoft.com", "*.srv.nintendo.net", "*.battlenet.com.cn"
        ],
        "default-nameserver": ["223.5.5.5", "119.29.29.29"],
        "proxy-server-nameserver": [
            "https://dns.alidns.com/dns-query",
            "https://doh.pub/dns-query"
        ],
        "nameserver": [
            "https://1.1.1.1/dns-query#主代理",
            "https://8.8.8.8/dns-query#主代理"
        ],
        "nameserver-policy": {
            "geosite:private": ["system://"],
            "geosite:category-ads-all": ["rcode://name_error"],
            "geosite:cn": [
                "https://dns.alidns.com/dns-query",
                "https://doh.pub/dns-query"
            ]
        }
    };

    const excludeFilter = '(?i)(剩余|官网|套餐|流量|到期|过期|更新|刷新|订阅|群|网址|客服|欢迎|加入|Expire|Traffic|Reset|(^|[^A-Za-z0-9])(\\d+(\\.\\d+)?\\s*(GB|TB)|\\d+\\s*Days?|Date)([^A-Za-z0-9]|$))';

    const regions = [
        { name: "BD", regex: "(?i)(孟加拉|孟加拉國|达卡|達卡|🇧🇩|(^|[^A-Za-z])BD([^A-Za-z]|$)|(^|[^A-Za-z])BGD([^A-Za-z]|$)|Bangladesh|Dhaka)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/bd.svg" },
        { name: "DE", regex: "(?i)(德国|德國|法兰克福|法蘭克福|🇩🇪|(^|[^A-Za-z])DE([^A-Za-z]|$)|(^|[^A-Za-z])DEU([^A-Za-z]|$)|Germany|Frankfurt)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/de.svg" },
        { name: "FR", regex: "(?i)(法国|法國|巴黎|🇫🇷|(^|[^A-Za-z])FR([^A-Za-z]|$)|(^|[^A-Za-z])FRA([^A-Za-z]|$)|France|Paris)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/fr.svg" },
        { name: "GB", regex: "(?i)(英国|英國|伦敦|倫敦|🇬🇧|(^|[^A-Za-z])UK([^A-Za-z]|$)|(^|[^A-Za-z])GB([^A-Za-z]|$)|(^|[^A-Za-z])GBR([^A-Za-z]|$)|United[ -]?Kingdom|England|London)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/gb.svg" },
        { name: "HK", regex: "(?i)(香港|🇭🇰|(^|[^A-Za-z])HK([^A-Za-z]|$)|(^|[^A-Za-z])HKG([^A-Za-z]|$)|Hong[ -]?Kong)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/hk.svg" },
        {
            name: "ID",
            regex: "(?i:印度尼西亚|印度尼西亞|印尼|雅加达|雅加達|🇮🇩|Indonesia|Jakarta)|(?:^|[|/·•][ ]*)ID(?:[ ]*(?:[|/_·•-]|[0-9])|$)|(?:^|[^A-Za-z0-9])IDN(?:[^A-Za-z]|$)",
            localRegexes: [
                { source: "印度尼西亚|印度尼西亞|印尼|雅加达|雅加達|🇮🇩|Indonesia|Jakarta", flags: "i" },
                { source: "(?:^|[|/·•][ ]*)ID(?:[ ]*(?:[|/_·•-]|[0-9])|$)|(?:^|[^A-Za-z0-9])IDN(?:[^A-Za-z]|$)", flags: "" }
            ],
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/id.svg"
        },
        {
            name: "IN",
            regex: "(?i:印度([^尼]|$)|新德里|孟买|孟買|班加罗尔|班加羅爾|🇮🇳|(^|[^A-Za-z])India([^A-Za-z]|$)|Mumbai|Delhi|Bangalore)|(?:^|[^A-Za-z0-9])(?:IN|IND)(?:[^A-Za-z]|$)",
            localRegexes: [
                { source: "印度([^尼]|$)|新德里|孟买|孟買|班加罗尔|班加羅爾|🇮🇳|(^|[^A-Za-z])India([^A-Za-z]|$)|Mumbai|Delhi|Bangalore", flags: "i" },
                { source: "(?:^|[^A-Za-z0-9])(?:IN|IND)(?:[^A-Za-z]|$)", flags: "" }
            ],
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/in.svg"
        },
        { name: "JP", regex: "(?i)(日本|东京|東京|大阪|🇯🇵|(^|[^A-Za-z])JP([^A-Za-z]|$)|(^|[^A-Za-z])JPN([^A-Za-z]|$)|Japan)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/jp.svg" },
        { name: "KR", regex: "(?i)(韩国|韓国|南韩|南韓|首尔|首爾|🇰🇷|(^|[^A-Za-z])KR([^A-Za-z]|$)|(^|[^A-Za-z])KOR([^A-Za-z]|$)|Korea)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/kr.svg" },
        { name: "MY", regex: "(?i)(马来西亚|馬來西亞|吉隆坡|🇲🇾|(^|[^A-Za-z])MY([^A-Za-z]|$)|(^|[^A-Za-z])MYS([^A-Za-z]|$)|Malaysia)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/my.svg" },
        { name: "NL", regex: "(?i)(荷兰|荷蘭|阿姆斯特丹|🇳🇱|(^|[^A-Za-z])NL([^A-Za-z]|$)|(^|[^A-Za-z])NLD([^A-Za-z]|$)|Netherlands|Amsterdam)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/nl.svg" },
        { name: "PH", regex: "(?i)(菲律宾|菲律賓|马尼拉|馬尼拉|宿务|宿霧|🇵🇭|(^|[^A-Za-z])PH([^A-Za-z]|$)|(^|[^A-Za-z])PHL([^A-Za-z]|$)|Philippines|Manila|Cebu)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/ph.svg" },
        { name: "SG", regex: "(?i)(新加坡|狮城|獅城|🇸🇬|(^|[^A-Za-z])SG([^A-Za-z]|$)|(^|[^A-Za-z])SGP([^A-Za-z]|$)|Singapore)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/sg.svg" },
        {
            name: "TH",
            regex: "(?i:泰国|泰國|曼谷|🇹🇭|Thailand|Bangkok)|(?:^|[^A-Za-z0-9])(?:TH|THA)(?:[^A-Za-z]|$)",
            localRegexes: [
                { source: "泰国|泰國|曼谷|🇹🇭|Thailand|Bangkok", flags: "i" },
                { source: "(?:^|[^A-Za-z0-9])(?:TH|THA)(?:[^A-Za-z]|$)", flags: "" }
            ],
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/th.svg"
        },
        { name: "TW", regex: "(?i)(台湾|台灣|台北|新北|🇹🇼|(^|[^A-Za-z])TW([^A-Za-z]|$)|(^|[^A-Za-z])TWN([^A-Za-z]|$)|Taiwan)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/tw.svg" },
        { name: "US", regex: "(?i)(美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|硅谷|矽谷|西雅图|西雅圖|纽约|紐約|🇺🇸|(^|[^A-Za-z])US([^A-Za-z]|$)|(^|[^A-Za-z])USA([^A-Za-z]|$)|United[ -]?States)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/us.svg" },
        { name: "VN", regex: "(?i)(越南|河内|河內|胡志明|🇻🇳|(^|[^A-Za-z])VN([^A-Za-z]|$)|(^|[^A-Za-z])VNM([^A-Za-z]|$)|Viet[ -]?Nam|Hanoi|Ho[ -]?Chi[ -]?Minh)", icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/vn.svg" }
    ];

    // 只保留机场实际下发了节点的地区，没有对应节点的地区分组不再生成
    // 注意：脚本本身运行在 JS 引擎里，(?i) 是 Go 正则语法，JS RegExp 不支持，
    // 这里做本地匹配时要去掉 (?i) 前缀改用 JS 的 i 标志；需要区分大小写的地区则提供 localRegexes。
    // filter/exclude-filter 字段本身保持 Go 正则写法不动，那是给 Mihomo 核心用的。
    const toJsRegex = (goStyleRegex) => new RegExp(goStyleRegex.replace(/^\(\?i\)/, ""), "i");
    const getLocalRegexes = (region) => region.localRegexes
        ? region.localRegexes.map(({ source, flags }) => new RegExp(source, flags))
        : [toJsRegex(region.regex)];
    const allProxies = (params.proxies || []).filter(p => p.type !== "direct");
    const hasProxyProviders = Object.keys(params["proxy-providers"] || {}).length > 0;
    const excludeRe = toJsRegex(excludeFilter);
    const matchedRegions = regions.filter(r => {
        const filterRes = getLocalRegexes(r);
        return allProxies.some(p => filterRes.some(re => re.test(p.name)) && !excludeRe.test(p.name));
    });

    // 普通订阅按已展开节点动态生成；只要存在 proxy-providers（包括与本地节点混用），
    // 就预先生成全部地区组，待 Mihomo 载入 provider 后再由 filter 筛选。
    const activeRegions = hasProxyProviders
        ? regions
        : matchedRegions;
    const hasActiveRegions = activeRegions.length > 0;

    let groups = [];

    groups.push({
        name: "主代理",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Proxy.png",
        proxies: hasActiveRegions
            ? ["自动", "静态", "DIRECT"]
            : ["静态", "DIRECT"]
    });

    if (hasActiveRegions) {
        groups.push({
            name: "自动",
            type: "select",
            icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Auto.png",
            proxies: activeRegions.map(r => `${r.name} 自动`)
        });
    }

    groups.push({
        name: "静态",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Static.png",
        "include-all": true,
        "exclude-type": "direct",
        "exclude-filter": excludeFilter,
        "empty-fallback": "REJECT"
    });

    const appProxiesList = [
        "主代理", "静态", "DIRECT",
        ...activeRegions.map(r => `${r.name} 自动`),
        ...activeRegions.map(r => `${r.name} 静态`)
    ];

    const apps = [
        { name: "AI", icon: "openai.png" }, { name: "Apple", icon: "apple.png" },
        { name: "GitHub", icon: "https://i.postimg.cc/vTSTYrLQ/github.png" },
        { name: "Google", icon: "google.png" }, { name: "Microsoft", icon: "microsoft.png" },
        { name: "Netflix", icon: "netflix.png" }, { name: "Telegram", icon: "telegram.png" },
        { name: "TikTok", icon: "tiktok.png" }, { name: "Twitch", icon: "twitch.png" },
        { name: "YouTube", icon: "youtube.png" }
    ];

    apps.forEach(app => {
        const icon = app.icon.startsWith("http")
            ? app.icon
            : `https://fastly.jsdelivr.net/gh/shindgew/WHATSINStash@main/icon/${app.icon}`;
        groups.push({
            name: app.name,
            type: "select",
            icon: icon,
            proxies: appProxiesList
        });
    });

    activeRegions.forEach(r => {
        const regionIcon = r.icon;

        groups.push({
            name: `${r.name} 自动`,
            type: "url-test",
            hidden: true,
            icon: regionIcon,
            "include-all": true,
            "exclude-type": "direct",
            "filter": r.regex,
            "exclude-filter": excludeFilter,
            "empty-fallback": "REJECT",
            "url": "https://www.gstatic.com/generate_204",
            "interval": 300,
            "tolerance": 100,
            "lazy": true,
            "timeout": 5000,
            "max-failed-times": 5,
            "expected-status": 204
        });

        groups.push({
            name: `${r.name} 静态`,
            type: "select",
            icon: regionIcon,
            "include-all": true,
            "exclude-type": "direct",
            "filter": r.regex,
            "exclude-filter": excludeFilter,
            "empty-fallback": "REJECT"
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
        "GEOSITE,tiktok,TikTok",
        "GEOSITE,telegram,Telegram",
        "GEOIP,telegram,Telegram,no-resolve",
        "GEOSITE,google,Google",
        "GEOSITE,category-ai-!cn,AI",
        "GEOSITE,netflix,Netflix",
        "GEOSITE,apple,Apple",
        "GEOSITE,github,GitHub",
        "GEOSITE,microsoft,Microsoft",
        "GEOSITE,cn,DIRECT",
        "GEOIP,cn,DIRECT,no-resolve",
        "MATCH,主代理"
    ];

    return params;
}

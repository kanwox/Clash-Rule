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
        "proxy-server-nameserver": ["223.5.5.5", "119.29.29.29"],
        "nameserver": [
            "https://1.1.1.1/dns-query#主代理",
            "https://8.8.8.8/dns-query#主代理"
        ],
        "nameserver-policy": {
            "geosite:category-ads-all": ["rcode://name_error"],
            "geosite:cn": [
                "https://dns.alidns.com/dns-query",
                "https://doh.pub/dns-query"
            ]
        }
    };

    const excludeFilter = '(?i)(剩余|官网|套餐|流量|到期|过期|更新|刷新|订阅|群|网址|客服|Expire|Traffic|Reset|(^|[^A-Za-z0-9])(\\d+(\\.\\d+)?\\s*(GB|TB)|\\d+\\s*Days?|Date)([^A-Za-z0-9]|$))';

    const regions = [
        { name: "HK", regex: "(?i)(香港|🇭🇰|(^|[^A-Za-z])HK([^A-Za-z]|$)|Hong[ -]?Kong)", icon: "Hong_Kong.png" },
        { name: "JP", regex: "(?i)(日本|东京|東京|大阪|🇯🇵|(^|[^A-Za-z])JP([^A-Za-z]|$)|Japan)", icon: "Japan.png" },
        { name: "KR", regex: "(?i)(韩国|韓国|南韩|南韓|首尔|首爾|🇰🇷|(^|[^A-Za-z])KR([^A-Za-z]|$)|(^|[^A-Za-z])KOR([^A-Za-z]|$)|Korea)", icon: "Korea.png" },
        { name: "SG", regex: "(?i)(新加坡|狮城|獅城|🇸🇬|(^|[^A-Za-z])SG([^A-Za-z]|$)|Singapore)", icon: "Singapore.png" },
        { name: "TW", regex: "(?i)(台湾|台灣|台北|新北|🇹🇼|(^|[^A-Za-z])TW([^A-Za-z]|$)|Taiwan)", icon: "Taiwan.png" },
        { name: "US", regex: "(?i)(美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|硅谷|矽谷|西雅图|西雅圖|纽约|紐約|🇺🇸|(^|[^A-Za-z])US([^A-Za-z]|$)|(^|[^A-Za-z])USA([^A-Za-z]|$)|United[ -]?States)", icon: "United_States.png" }
    ];

    let groups = [];

    groups.push({
        name: "主代理",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Proxy.png",
        proxies: ["自动", "均衡", "静态", "DIRECT"]
    });

    groups.push({
        name: "自动",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Auto.png",
        proxies: regions.map(r => `${r.name} 自动`)
    });

    groups.push({
        name: "均衡",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Available.png",
        proxies: regions.map(r => `${r.name} 均衡`)
    });

    groups.push({
        name: "静态",
        type: "select",
        icon: "https://fastly.jsdelivr.net/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Static.png",
        "include-all": true,
        "exclude-type": "direct",
        "exclude-filter": excludeFilter
    });

    const appProxiesList = [
        "主代理", "DIRECT",
        ...regions.map(r => `${r.name} 自动`),
        ...regions.map(r => `${r.name} 均衡`),
        ...regions.map(r => `${r.name} 静态`)
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

    regions.forEach(r => {
        groups.push({
            name: `${r.name} 自动`,
            type: "url-test",
            hidden: true,
            icon: `https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/${r.icon}`,
            "include-all": true,
            "exclude-type": "direct",
            "filter": r.regex,
            "exclude-filter": excludeFilter,
            "empty-fallback": "REJECT",
            "url": "https://www.gstatic.com/generate_204",
            "interval": 600,
            "tolerance": 100,
            "lazy": true,
            "timeout": 5000,
            "max-failed-times": 5,
            "expected-status": 204
        });

        groups.push({
            name: `${r.name} 均衡`,
            type: "load-balance",
            hidden: true,
            icon: `https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/${r.icon}`,
            "strategy": "consistent-hashing",
            "include-all": true,
            "exclude-type": "direct",
            "filter": r.regex,
            "exclude-filter": excludeFilter,
            "empty-fallback": "REJECT",
            "url": "https://www.gstatic.com/generate_204",
            "interval": 300
        });

        groups.push({
            name: `${r.name} 静态`,
            type: "select",
            icon: `https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/${r.icon}`,
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
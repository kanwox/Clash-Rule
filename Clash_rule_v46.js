function main(params) {
    const basicOptions = {
  "mixed-port": 7892,
  "allow-lan": false,
  "mode": "rule",
  "log-level": "info",
  "unified-delay": true,
  "tcp-concurrent": true,
  "geodata-mode": true,
  "geo-auto-update": true,
  "geo-update-interval": 720,
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
        "sniff": {
            "HTTP": {
                "ports": ["80", "8080-8880"],
                "override-destination": true
            },
            "TLS": {
                "ports": ["443", "8443"]
            },
            "QUIC": {
                "ports": ["443", "8443"]
            }
        },
        "skip-domain": [
            "Mijia Cloud",
            "+.push.apple.com"
        ]
    };

    params["dns"] = {
        "enable": true,
        "listen": "127.0.0.1:1053",
        "ipv6": true,
        "prefer-h3": true,
        "use-hosts": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter": [
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
            "+.battlenet.com.cn"
        ],
        "default-nameserver": [
            "223.5.5.5",
            "119.29.29.29"
        ],
        "proxy-server-nameserver": [
            "https://dns.alidns.com/dns-query",
            "https://doh.pub/dns-query"
        ],
        "nameserver": [
            "https://1.1.1.1/dns-query#主代理",
            "https://8.8.8.8/dns-query#主代理"
        ],
        /*
         * 兜底：国内 DoH 直连。
         * 当主代理被切到 DIRECT、或代理故障导致
         * nameserver 不可达时，由 fallback 接管解析，
         * 避免 DNS 整体瘫痪。
         * 注意：此处刻意不配置 fallback-filter——
         * nameserver 已是代理内的无污染 DNS，
         * 若加 geoip 过滤，反而会把境外域名的解析结果
         * 替换成 fallback 可能已被污染的结果。
         */
        "fallback": [
            "https://dns.alidns.com/dns-query",
            "https://doh.pub/dns-query"
        ],
        "nameserver-policy": {
            "geosite:private": [
                "system://"
            ],
            "geosite:category-ads-all": [
                "rcode://name_error"
            ],
            "geosite:cn": [
                "https://dns.alidns.com/dns-query",
                "https://doh.pub/dns-query"
            ]
        }
    };

    /*
     * 内联节点优先使用 IPv4。
     * 双栈节点优先 IPv4，只有 IPv6 地址时仍可使用 IPv6。
     */
    (params.proxies || []).forEach(proxy => {
        if (proxy && proxy.type !== "direct") {
            proxy["ip-version"] = "ipv4-prefer";
        }
    });

    /*
     * 对远程节点提供器中的节点应用相同设置。
     * 保留提供器原有的其他覆盖设置。
     */
    Object.values(params["proxy-providers"] || {}).forEach(provider => {
        if (provider && typeof provider === "object") {
            provider.override = Object.assign(
                {},
                provider.override || {},
                {
                    "ip-version": "ipv4-prefer"
                }
            );
        }
    });

    /*
     * 为吃 uTLS 指纹的 TLS 节点补 client-fingerprint=chrome。
     * 只处理 vless/vmess/trojan 且确实走 TLS 的; 已自带指纹、QUIC 系、ss 等一律不碰。
     */
    const FP_OK = ["vless", "vmess", "trojan"];
    (params.proxies || []).forEach(proxy => {
        if (!proxy || FP_OK.indexOf(proxy.type) === -1) return;   // 协议不在白名单
        if (proxy["client-fingerprint"]) return;                  // 已自带
        const usesTLS = proxy.type === "trojan" || proxy.tls === true || proxy["reality-opts"];
        if (usesTLS) proxy["client-fingerprint"] = "chrome";
    });

    const excludeFilter = '(?i)(剩余|官网|套餐|流量|到期|过期|更新|刷新|订阅|群|网址|客服|欢迎|加入|Expire|Traffic|Reset|(^|[^A-Za-z0-9])(\\d+(\\.\\d+)?\\s*(GB|TB)|\\d+\\s*Days?|Date)([^A-Za-z0-9]|$))';

    const regions = [
        {
            name: "BD",
            regex: "(?i)(孟加拉|孟加拉國|达卡|達卡|🇧🇩|(^|[^A-Za-z])BD([^A-Za-z]|$)|(^|[^A-Za-z])BGD([^A-Za-z]|$)|Bangladesh|Dhaka)",
            icon: "https://raw.githubusercontent.com/HatScripts/circle-flags/gh-pages/flags/bd.svg"
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

    const toJsRegex = goStyleRegex =>
        new RegExp(goStyleRegex.replace(/^\(\?i\)/, ""), "i");

    const getLocalRegexes = region => [toJsRegex(region.regex)];

    const allProxies = (params.proxies || []).filter(
        proxy => proxy.type !== "direct"
    );

    /*
     * 检查是否存在远程节点提供器。
     * 存在时保留全部候选国家组，防止遗漏尚未展开的远程节点。
     */
    const hasProxyProviders =
        Object.keys(params["proxy-providers"] || {}).length > 0;

    const excludeRe = toJsRegex(excludeFilter);

    const matchedRegions = regions.filter(region => {
        const filterRes = getLocalRegexes(region);

        return allProxies.some(proxy =>
            filterRes.some(regex => regex.test(proxy.name)) &&
            !excludeRe.test(proxy.name)
        );
    });

    /*
     * 没有远程节点提供器时，只生成实际匹配到的国家组。
     * 存在远程节点提供器时，保留全部候选国家组，
     * 等内核载入远程节点后再按名称过滤。
     */
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
            proxies: activeRegions.map(region => `${region.name} 自动`)
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

    /*
     * 应用分流组：取消所有静态组，直接内联全部节点列表。
     * 复用 excludeFilter 过滤流量/到期等工具节点。
     */
    const allProxyNames = allProxies
        .filter(proxy => !excludeRe.test(proxy.name))
        .map(proxy => proxy.name);

    const appProxiesList = [
        "主代理",
        "DIRECT",
        ...activeRegions.map(region => `${region.name} 自动`),
        ...allProxyNames
    ];

    const apps = [
        {
            name: "AI",
            icon: "openai.png"
        },
        {
            name: "Apple",
            icon: "apple.png"
        },
        {
            name: "GitHub",
            icon: "https://i.postimg.cc/vTSTYrLQ/github.png"
        },
        {
            name: "Google",
            icon: "google.png"
        },
        {
            name: "Microsoft",
            icon: "microsoft.png"
        },
        {
            name: "Telegram",
            icon: "telegram.png"
        },
        {
            name: "TikTok",
            icon: "tiktok.png"
        },
        {
            name: "TV",
            icon: "netflix.png"
        },
        {
            name: "Twitch",
            icon: "twitch.png"
        },
        {
            name: "X",
            icon: "x.png"
        },
        {
            name: "YouTube",
            icon: "youtube.png"
        }
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

    activeRegions.forEach(region => {
        const regionIcon = region.icon;

        groups.push({
            name: `${region.name} 自动`,
            type: "url-test",
            hidden: true,
            icon: regionIcon,
            "include-all": true,
            "exclude-type": "direct",
            "filter": region.regex,
            "exclude-filter": excludeFilter,
            "empty-fallback": "REJECT",
            "url": "https://www.gstatic.com/generate_204",
            "interval": 300,
            "tolerance": 50,
            "lazy": true,
            "timeout": 5000,
            "max-failed-times": 5,
            "expected-status": 204
        });
    });

    params["proxy-groups"] = groups;

    delete params["rule-providers"];

    params["rules"] = [
        /*
         * 私有网络与广告拦截。
         */
        "GEOSITE,private,DIRECT",
        "GEOIP,private,DIRECT,no-resolve",
        "GEOSITE,category-ads-all,REJECT",

        /*
         * 独立产品和子产品规则。
         * 必须放在大厂通用规则之前。
         */
        "GEOSITE,youtube,YouTube",
        "GEOSITE,twitch,Twitch",
        "GEOSITE,twitter,X",
        "GEOSITE,tiktok,TikTok",
        "GEOSITE,telegram,Telegram",
        "GEOIP,telegram,Telegram,no-resolve",
        "GEOSITE,category-ai-!cn,AI",
        "GEOSITE,github,GitHub",

        /*
         * TV 流媒体：
         * Netflix、Disney+、Amazon Prime Video、
         * Apple TV+、Max/HBO。
         *
         * Apple TV+ 位于 Apple 通用规则之前，
         * 防止被 Apple 分组提前匹配。
         */
        "GEOSITE,netflix,TV",
        "GEOSITE,disney,TV",
        "GEOSITE,primevideo,TV",
        "GEOSITE,apple-tvplus,TV",
        "DOMAIN-SUFFIX,max.com,TV",
        "GEOSITE,hbo,TV",

        /*
         * 大厂通用规则。
         *
         * YouTube 已在 Google 前面；
         * Apple TV+ 已在 Apple 前面；
         * GitHub 已在 Microsoft 前面。
         *
         * 注意：放在 cn 直连之前，
         * 防止 Google/Apple/Microsoft 域名被 geosite:cn 误判后直连，
         * 导致 Google Play 等下载失败。
         */
        "GEOSITE,google,Google",
        "GEOSITE,apple,Apple",
        "GEOSITE,microsoft,Microsoft",

        /*
         * 中国大陆域名与 IP 直连。
         * 已移到最底部，仅在未被上述规则匹配时才生效。
         */
        "GEOSITE,cn,DIRECT",
        "GEOIP,cn,DIRECT,no-resolve",

        /*
         * 最终兜底。
         */
        "MATCH,主代理"
    ];

    return params;
}

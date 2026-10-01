// Clash_rule.js V5.4
// 需较新的 mihomo 内核；首次启动联网下载规则集，在日志确认全部下载成功。

// ── 可调参数（集中维护） ──
const DEFAULT_IP_VERSION = "dual"; // 双栈偏好：dual(并发择优) / ipv6-prefer / ipv4-prefer
const REGION_MIN_NODES = 2;        // 达到该值才建组；provider 订阅时节点不可见，不参与判断
const RS_INTERVAL = 2592000;       // 规则集默认更新周期
const ADS_INTERVAL = 604800;       // 广告规则集：一周（时效性最强）
const CN_DNS_DOH = [
    "https://223.5.5.5/dns-query",
    "https://doh.pub/dns-query"
];
const CN_DNS_PLAIN = ["223.5.5.5", "119.29.29.29"];
const TEST_URL_PROXY = "https://www.gstatic.com/generate_204";
const PREFER_H3 = false;          // DoH 并发尝试 HTTP/3：UDP 被限速或不支持时反而更慢
const BLOCK_QUIC = false;         // 拒绝 UDP 443 迫使回退 TCP；仅节点不支持 UDP 时开（国内直连 QUIC 会一并回退）

// 部分客户端脚本引擎无 console.warn：统一经此降级输出，避免 TypeError 中断转换
const warnLog = (...args) => {
    if (typeof console === "undefined") return;
    if (typeof console.warn === "function") console.warn(...args);
    else if (typeof console.log === "function") console.log(...args);
};

const isPlainObject = value =>
    value &&
    typeof value === "object" &&
    !Array.isArray(value);

function main(params) {
    if (!params || typeof params !== "object") params = {};
    if (!Array.isArray(params.proxies)) params.proxies = [];

    // 内核要求节点名非空且唯一，空名/非法条目会让整份配置启动失败，直接丢弃
    params.proxies = params.proxies.filter(
        proxy =>
            proxy &&
            typeof proxy.name === "string" &&
            proxy.name !== ""
    );

    // 记住面板手动选择与 fake-ip 缓存；订阅已设置的项以订阅为准
    params.profile = Object.assign(
        { "store-selected": true, "store-fake-ip": true },
        isPlainObject(params.profile) ? params.profile : {}
    );

    // 订阅自身是否使用代理集合（决定地区组是全量还是按节点数筛选）
    const subHasProviders =
        Object.keys(params["proxy-providers"] || {}).length > 0;
    // 订阅原始 rule-providers 快照：判断 rule-set: 依赖是否确有定义，须在下方覆写前读取
    const subRuleProviders = Object.assign(
        {},
        params["rule-providers"] || {}
    );

    const basicOptions = {
        "unified-delay": true,
        "tcp-concurrent": true,
        // 不匹配进程名：省掉每条连接的进程查找
        "find-process-mode": "off",
        // TCP 保活（秒）：平衡移动端电量与 NAT 会话活性，避免被中间网关静默重置
        "keep-alive-idle": 300,
        "keep-alive-interval": 30
    };
    // IPv6 仅订阅显式开启才开启（避免纯 IPv4 下双栈重试与 AAAA fake-ip 兼容问题）
    const ipv6Enabled = params.ipv6 === true;
    params.ipv6 = ipv6Enabled;
    Object.assign(params, basicOptions);
    // 内核已移除该字段并会在启动时报错
    delete params["global-client-fingerprint"];

    params.sniffer = {
        enable: true,
        "force-dns-mapping": true,
        // 纯 IP 流量强制嗅探：应用绕过系统 DNS 直连 IP 时，从 TLS SNI / HTTP Host 还原域名参与分流，避免兜底误判
        "parse-pure-ip": true,
        "override-destination": true,
        sniff: {
            HTTP: {
                ports: [80, "8080-8880"],
                "override-destination": true
            },
            TLS: {
                ports: [443, 8443]
            },
            QUIC: {
                ports: [443, 8443]
            }
        },
        "skip-domain": [
            // "Mijia Cloud" 不是域名；现行内核对 skip-domain 按域名模式校验，单标签条目按精确匹配处理：
            // 米家设备 SNI 恰好就是 "Mijia Cloud"，可命中并跳过嗅探；并非子串匹配，SNI 带前后缀时不生效
            "Mijia Cloud",
            "+.apple.com",
            "+.openai.com",
            "+.oaistatic.com",
            "+.oaiusercontent.com",
            "+.chatgpt.com"
        ]
    };

    // 节点名里的信息类关键词（剩余流量、到期时间、群链接等），这些不该单独成为可选节点
    const excludeFilter =
        "(?i)(剩余|官网|套餐|流量|到期|过期|更新|刷新|订阅|群|网址|客服|欢迎|加入|Expire|Traffic|Reset|(^|[^A-Za-z0-9])(\\d+(\\.\\d+)?\\s*(GB|TB)|\\d+\\s*Days?)([^A-Za-z0-9]|$))";

    // 地区表。regex 两处共用同一串：内核 group filter 是 Go 正则（(?i) 合法），JS 侧经 toJsRegex 转换
    const regions = [
        {
            name: "AE",
            regex: "(?i)(阿联酋|阿聯酋|迪拜|阿布扎比|🇦🇪|(^|[^A-Za-z])UAE([^A-Za-z]|$)|Emirates|Dubai)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/ae.svg"
        },
        {
            name: "AR",
            regex: "(?i)(阿根廷|布宜诺斯艾利斯|🇦🇷|(^|[^A-Za-z])AR([^A-Za-z]|$)|(^|[^A-Za-z])ARG([^A-Za-z]|$)|Argentina)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/ar.svg"
        },
        {
            name: "AU",
            regex: "(?i)(澳大利亚|澳大利亞|澳洲|悉尼|墨尔本|墨爾本|🇦🇺|(^|[^A-Za-z])AU([^A-Za-z]|$)|(^|[^A-Za-z])AUS([^A-Za-z]|$)|Australia|Sydney|Melbourne)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/au.svg"
        },
        {
            name: "BD",
            regex: "(?i)(孟加拉|孟加拉國|达卡|達卡|🇧🇩|(^|[^A-Za-z])BD([^A-Za-z]|$)|(^|[^A-Za-z])BGD([^A-Za-z]|$)|Bangladesh|Dhaka)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/bd.svg"
        },
        {
            name: "BR",
            regex: "(?i)(巴西|圣保罗|聖保羅|🇧🇷|(^|[^A-Za-z])BR([^A-Za-z]|$)|(^|[^A-Za-z])BRA([^A-Za-z]|$)|Brazil|Brasil|SaoPaulo)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/br.svg"
        },
        {
            name: "CA",
            regex: "(?i)(加拿大|多伦多|多倫多|温哥华|溫哥華|🇨🇦|(^|[^A-Za-z])CA([^A-Za-z]|$)|(^|[^A-Za-z])CAN([^A-Za-z]|$)|Canada|Toronto|Vancouver)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/ca.svg"
        },
        {
            name: "DE",
            regex: "(?i)(德国|德國|法兰克福|法蘭克福|🇩🇪|(^|[^A-Za-z])DE([^A-Za-z]|$)|(^|[^A-Za-z])DEU([^A-Za-z]|$)|Germany|Frankfurt)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/de.svg"
        },
        {
            name: "FR",
            regex: "(?i)(法国|法國|巴黎|🇫🇷|(^|[^A-Za-z])FR([^A-Za-z]|$)|(^|[^A-Za-z])FRA([^A-Za-z]|$)|France|Paris)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/fr.svg"
        },
        {
            name: "GB",
            regex: "(?i)(英国|英國|伦敦|倫敦|🇬🇧|(^|[^A-Za-z])UK([^A-Za-z]|$)|(^|[^A-Za-z])GB([^A-Za-z]|$)|(^|[^A-Za-z])GBR([^A-Za-z]|$)|United[ -]?Kingdom|England|London)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/gb.svg"
        },
        {
            name: "HK",
            regex: "(?i)(香港|🇭🇰|(^|[^A-Za-z])HK([^A-Za-z]|$)|(^|[^A-Za-z])HKG([^A-Za-z]|$)|Hong[ -]?Kong)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/hk.svg"
        },
        {
            name: "ID",
            regex: "(?i)(印度尼西亚|印度尼西亞|印尼|雅加达|雅加達|🇮🇩|Indonesia|Jakarta|(^|[^A-Za-z])ID([^A-Za-z]|$)|(^|[^A-Za-z])IDN([^A-Za-z]|$))",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/id.svg"
        },
        {
            // 印度([^尼]|$) 只排除"印度尼西亚"；含独立 token IN 的节点名会同时命中 ID 与 IN，内核各组 filter 相互独立、无组间排除
            name: "IN",
            regex: "(?i)(印度([^尼]|$)|新德里|孟买|孟買|班加罗尔|班加羅爾|🇮🇳|(^|[^A-Za-z])India([^A-Za-z]|$)|Mumbai|Delhi|Bangalore|(^|[^A-Za-z])IN([^A-Za-z]|$)|(^|[^A-Za-z])IND([^A-Za-z]|$))",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/in.svg"
        },
        {
            name: "JP",
            regex: "(?i)(日本|东京|東京|大阪|🇯🇵|(^|[^A-Za-z])JP([^A-Za-z]|$)|(^|[^A-Za-z])JPN([^A-Za-z]|$)|Japan)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/jp.svg"
        },
        {
            name: "KR",
            regex: "(?i)(韩国|韓國|南韩|南韓|首尔|首爾|🇰🇷|(^|[^A-Za-z])KR([^A-Za-z]|$)|(^|[^A-Za-z])KOR([^A-Za-z]|$)|Korea)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/kr.svg"
        },
        {
            name: "MY",
            regex: "(?i)(马来西亚|馬來西亞|吉隆坡|🇲🇾|(^|[^A-Za-z])MY([^A-Za-z]|$)|(^|[^A-Za-z])MYS([^A-Za-z]|$)|Malaysia)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/my.svg"
        },
        {
            name: "NL",
            regex: "(?i)(荷兰|荷蘭|阿姆斯特丹|🇳🇱|(^|[^A-Za-z])NL([^A-Za-z]|$)|(^|[^A-Za-z])NLD([^A-Za-z]|$)|Netherlands|Amsterdam)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/nl.svg"
        },
        {
            name: "PH",
            regex: "(?i)(菲律宾|菲律賓|马尼拉|馬尼拉|宿务|宿霧|🇵🇭|(^|[^A-Za-z])PH([^A-Za-z]|$)|(^|[^A-Za-z])PHL([^A-Za-z]|$)|Philippines|Manila|Cebu)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/ph.svg"
        },
        {
            name: "SG",
            regex: "(?i)(新加坡|狮城|獅城|🇸🇬|(^|[^A-Za-z])SG([^A-Za-z]|$)|(^|[^A-Za-z])SGP([^A-Za-z]|$)|Singapore)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/sg.svg"
        },
        {
            name: "TH",
            regex: "(?i)(泰国|泰國|曼谷|🇹🇭|Thailand|Bangkok|(^|[^A-Za-z])TH([^A-Za-z]|$)|(^|[^A-Za-z])THA([^A-Za-z]|$))",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/th.svg"
        },
        {
            name: "TR",
            regex: "(?i)(土耳其|伊斯坦布尔|🇹🇷|(^|[^A-Za-z])TR([^A-Za-z]|$)|(^|[^A-Za-z])TUR([^A-Za-z]|$)|Turkey|Türkiye|Istanbul)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/tr.svg"
        },
        {
            name: "TW",
            regex: "(?i)(台湾|台灣|台北|新北|🇹🇼|(^|[^A-Za-z])TW([^A-Za-z]|$)|(^|[^A-Za-z])TWN([^A-Za-z]|$)|Taiwan)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/tw.svg"
        },
        {
            name: "US",
            regex: "(?i)(美国|美國|洛杉矶|洛杉磯|圣何塞|聖何塞|硅谷|矽谷|西雅图|西雅圖|纽约|紐約|🇺🇸|(^|[^A-Za-z])US([^A-Za-z]|$)|(^|[^A-Za-z])USA([^A-Za-z]|$)|United[ -]?States)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/us.svg"
        },
        {
            name: "VN",
            regex: "(?i)(越南|河内|河內|胡志明|🇻🇳|(^|[^A-Za-z])VN([^A-Za-z]|$)|(^|[^A-Za-z])VNM([^A-Za-z]|$)|Viet[ -]?Nam|Hanoi|Ho[ -]?Chi[ -]?Minh)",
            icon: "https://cdn.jsdmirror.com/gh/HatScripts/circle-flags@gh-pages/flags/vn.svg"
        }
    ];

    // App 组名单与图标（OWN_GROUPS 派生与组生成共用）
    const apps = [
        { name: "AI", icon: "openai.png" },
        { name: "Apple", icon: "apple.png" },
        {
            name: "GitHub",
            icon: "https://cdn.jsdmirror.com/gh/kanwox/Stash-Conf@main/github.png"
        },
        { name: "Google", icon: "google.png" },
        { name: "Microsoft", icon: "microsoft.png" },
        { name: "Spotify", icon: "spotify.png" },
        { name: "Telegram", icon: "telegram.png" },
        { name: "TikTok", icon: "tiktok.png" },
        { name: "TV", icon: "netflix.png" },
        { name: "Twitch", icon: "twitch.png" },
        { name: "X", icon: "x.png" },
        { name: "YouTube", icon: "youtube.png" }
    ];

    // 脚本固定生成的组名（App 名由 apps 派生）
    const OWN_GROUPS = [
        "主代理",
        "静态",
        "直连",
        ...apps.map(app => app.name)
    ];

    // 内建策略名。RULES 由内核单独特判：DNS 连接按路由规则出站，不查策略表
    const BUILTIN_POLICIES = new Set([
        "DIRECT",
        "REJECT",
        "REJECT-DROP",
        "COMPATIBLE",
        "PASS",
        "PASS-RULE",
        "GLOBAL",
        "RULES"
    ]);

    // 内核中节点与策略组共享同一命名空间，且要求节点名唯一：与自建组/地区组/内建 outbound 重名的节点、
    // 以及订阅内的重名节点，都会让内核启动直接报错，这里抢先改名。须在地区统计、PROXY_NAMES 收集与
    // 组生成前完成；改名后的节点名照常参与地区分类（如 "节点·US" 仍命中 US 正则的独立 token 条件）
    const RESERVED_NAMES = new Set([
        ...OWN_GROUPS,
        ...regions.map(region => region.name),
        ...BUILTIN_POLICIES
    ]);

    const usedProxyNames = new Set();

    params.proxies.forEach(proxy => {
        let name = proxy.name;

        if (RESERVED_NAMES.has(name) || usedProxyNames.has(name)) {
            const reservedHit = RESERVED_NAMES.has(name);
            let candidate = name;
            let suffix = 0;

            do {
                suffix++;
                candidate = reservedHit
                    ? "节点·" + name + (suffix > 1 ? "·" + suffix : "")
                    : name + "·" + suffix;
            } while (
                RESERVED_NAMES.has(candidate) ||
                usedProxyNames.has(candidate)
            );

            name = candidate;
            proxy.name = name;
        }

        usedProxyNames.add(name);
    });

    // 内核用 Go 正则，JS 侧不支持 (?i) 前缀
    const toJsRegex = goStyleRegex =>
        new RegExp(goStyleRegex.replace(/^\(\?i\)/, ""), "i");

    // direct / reject 类型不进任何可选组，与下方组的 exclude-type 保持一致
    const allProxies = params.proxies.filter(
        proxy => proxy.type !== "direct" && proxy.type !== "reject"
    );
    const excludeRe = toJsRegex(excludeFilter);

    const matchedRegions = regions.filter(region => {
        const regex = toJsRegex(region.regex);
        let count = 0;

        for (const proxy of allProxies) {
            if (
                regex.test(proxy.name) &&
                !excludeRe.test(proxy.name)
            ) {
                count++;
                if (count >= REGION_MIN_NODES) return true;
            }
        }

        return false;
    });

    // provider 订阅时脚本期看不到节点，维持全量地区组
    const activeRegions = subHasProviders ? regions : matchedRegions;
    const hasActiveRegions = activeRegions.length > 0;

    // ── 订阅 DNS 悬空引用清洗 ──
    // 订阅 DNS 里指向已重建规则集/策略组的 "rule-set:" 键、"#组名" 后缀原样并入会硬报错；
    // geosite:/geoip: 引用会触发内核额外下载 geo 文件，均须清洗。脚本自身引用在下方独立写入，不受影响

    // 取自实际会建组的 activeRegions，避免引用到节点不足未建组的地区（内核找不到目标组）
    const REGION_NAMES = new Set(
        activeRegions.map(region => region.name)
    );

    // 本地节点名并入合法引用集："#节点名" 指定解析节点是内核支持的写法，不识别会被误剥；provider 订阅下该集合为空
    const PROXY_NAMES = new Set(
        allProxies.map(proxy => proxy && proxy.name).filter(Boolean)
    );

    // 校验 DNS 条目尾部 "#目标"：合法整条保留，指向已删除对象则剥掉并补 #RULES
    const refValid = ref =>
        BUILTIN_POLICIES.has(ref) ||
        OWN_GROUPS.indexOf(ref) !== -1 ||
        REGION_NAMES.has(ref) ||
        PROXY_NAMES.has(ref);

    const asPlainObject = value =>
        isPlainObject(value) ? value : {};

    const stringList = value => {
        if (value === undefined || value === null) return [];

        const list = Array.isArray(value) ? value : [value];

        return list
            .filter(item => typeof item === "string")
            .map(item => item.trim())
            .filter(Boolean);
    };

    // 解析 nameserver-policy / proxy-server-nameserver-policy 的 "rule-set:a,b" 逗号多值键
    const ruleSetNames = key => {
        const match = /^rule-set:(.+)$/i.exec(String(key));
        if (!match) return [];

        return match[1]
            .split(",")
            .map(name => name.trim())
            .filter(Boolean);
    };

    // 内核解析 # 后片段（config.parseNameServer）：按 "&" 分段，含 "=" 的是参数（h3=/ecs= 等），
    // 不含的是目标名，被误当网卡名会运行期静默失败；故只校验裸段、参数段原样保留
    const stripDanglingRef = entry => {
        const s = String(entry);
        const hash = s.indexOf("#");

        if (hash === -1) return s;

        const parts = s
            .slice(hash + 1)
            .split("&")
            .map(part => part.trim())
            .filter(Boolean)
            .filter(part => part.includes("=") || refValid(part));

        if (parts.length > 0) return s.slice(0, hash) + "#" + parts.join("&");

        // 无有效引用时补 #RULES 交给路由决定，避免剥成裸 URL 直连（DNS 直连会同时招致污染与泄漏）
        return s.slice(0, hash) + "#RULES";
    };

    // 节点解析 DNS 不得经代理/策略组出站，否则形成"需要节点才能解析节点"的循环
    const stripProxyRefs = entry => {
        const s = String(entry);
        const hash = s.indexOf("#");

        if (hash === -1) return s;

        const params = s
            .slice(hash + 1)
            .split("&")
            .map(part => part.trim())
            .filter(part => part !== "" && part.includes("="));

        return params.length > 0
            ? s.slice(0, hash) + "#" + params.join("&")
            : s.slice(0, hash);
    };

    const stripProxyRefsPolicy = policy => {
        const out = {};

        for (const key of Object.keys(policy)) {
            out[key] = stringList(policy[key]).map(stripProxyRefs);
        }

        return out;
    };

    // ── 读取订阅 DNS ──
    // 无"拒绝生成"分支：不可迁移字段一律静默丢弃、以脚本配置为准，永远输出完整配置；
    // 仅读取被异常打断时放弃订阅 DNS 整段（按无 DNS 处理，见下方 catch）
    const deriveSubDNS = rawDNS => {
        const subDNS = isPlainObject(rawDNS) ? rawDNS : {};

        const subPSN = stringList(
            subDNS["proxy-server-nameserver"]
        ).map(stripDanglingRef);

        const subNS = stringList(subDNS.nameserver).map(
            stripDanglingRef
        );

        const subPolicy = Object.assign(
            {},
            asPlainObject(subDNS["nameserver-policy"])
        );

        // fake-ip-filter 仅在缺省/blacklist 时继承；whitelist/rule 语义不同，继承会反转过滤含义，固定输出 blacklist
        const modeRaw = subDNS["fake-ip-filter-mode"];
        const mode =
            typeof modeRaw === "string"
                ? modeRaw.trim().toLowerCase()
                : "";

        const subFilter =
            mode === "" || mode === "blacklist"
                ? stringList(subDNS["fake-ip-filter"]).filter(
                      item =>
                          !/^(rule-set|geosite|geoip):/i.test(item)
                  )
                : [];

        // 逐键清洗：通吃键架空分流、指向重建规则集/内建 geo 的键会硬报错，均丢弃；值同样清洗悬空引用
        for (const key of Object.keys(subPolicy)) {
            if (key === "+." || key === "*" || key === "+") {
                delete subPolicy[key];
                continue;
            }

            if (/^(rule-set|geosite|geoip):/i.test(key)) {
                delete subPolicy[key];
                continue;
            }

            subPolicy[key] = stringList(subPolicy[key]).map(
                stripDanglingRef
            );
        }

        // ── 清洗 proxy-server-nameserver-policy ──
        // 键：geosite:/geoip: 丢弃；rule-set: 仅当该名字在订阅原始 rule-providers 中有定义时保留，
        // 并把该 provider 带入最终配置，查不到定义的视为悬空丢弃。
        // 值：用 stripDanglingRef 清洗。通吃键不删（区别于普通 nameserver-policy）：此字段只作用于节点域名，
        // 脚本不在此注入自身条目，通吃键不会覆盖任何脚本配置
        const rawPSNPolicy = asPlainObject(
            subDNS["proxy-server-nameserver-policy"]
        );

        const subPSNPolicy = {};
        const carriedRuleProviders = {};

        for (const key of Object.keys(rawPSNPolicy)) {
            if (/^(geosite|geoip):/i.test(key)) continue;

            const names = ruleSetNames(key);

            if (names.length > 0) {
                const validNames = names.filter(name =>
                    Object.prototype.hasOwnProperty.call(
                        subRuleProviders,
                        name
                    )
                );

                if (validNames.length > 0) {
                    for (const name of validNames) {
                        carriedRuleProviders[name] =
                            subRuleProviders[name];
                    }

                    subPSNPolicy[
                        "rule-set:" + validNames.join(",")
                    ] = stringList(rawPSNPolicy[key]).map(
                        stripDanglingRef
                    );
                }

                continue;
            }

            subPSNPolicy[key] = stringList(rawPSNPolicy[key]).map(
                stripDanglingRef
            );
        }

        let proxyServerNameserver;
        let proxyServerNameserverPolicy;

        if (subPSN.length > 0) {
            // 机场显式设置节点 DNS 时独占使用，不混入公共 DNS
            proxyServerNameserver = [
                ...new Set(subPSN.map(stripProxyRefs))
            ];
            proxyServerNameserverPolicy =
                stripProxyRefsPolicy(subPSNPolicy);
        } else {
            // 节点 policy 视为未设置：收集的旧 rule-set 依赖一并放弃，否则并入的 provider 无人引用、凭空下载
            for (const key of Object.keys(carriedRuleProviders)) {
                delete carriedRuleProviders[key];
            }

            // 未显式设置节点 DNS 时，以普通域名解析策略为迁移来源，避免新补公共 DNS 屏蔽机场专用解析
            const hasFallbackComplexity =
                subDNS.fallback !== undefined ||
                subDNS["fallback-filter"] !== undefined;

            if (hasFallbackComplexity) {
                // fallback 属"路由选出 DNS 出口"的复杂行为，无法在单一列表等价表达；忽略，节点解析直接用国内 DoH（不怕污染）
                proxyServerNameserver = [...CN_DNS_DOH];
                proxyServerNameserverPolicy = undefined;
            } else if (
                subNS.length > 0 ||
                Object.keys(subPolicy).length > 0
            ) {
                // 按原优先关系迁入节点解析（policy 优先于 nameserver 不变）
                proxyServerNameserver =
                    subNS.length > 0
                        ? [...new Set(subNS.map(stripProxyRefs))]
                        : [...CN_DNS_DOH];

                proxyServerNameserverPolicy =
                    Object.keys(subPolicy).length > 0
                        ? stripProxyRefsPolicy(subPolicy)
                        : undefined;
            } else {
                // 无任何可继承解析信息，用默认公共 DNS
                proxyServerNameserver = [...CN_DNS_DOH];
                proxyServerNameserverPolicy = undefined;
            }
        }

        return {
            subDNS,
            subNS,
            subPolicy,
            subFilter,
            carriedRuleProviders,
            proxyServerNameserver,
            proxyServerNameserverPolicy
        };
    };

    let dnsInfo;

    try {
        const rawDNS = params.dns;

        if (
            rawDNS !== undefined &&
            rawDNS !== null &&
            !isPlainObject(rawDNS)
        ) {
            throw new Error("dns 字段不是对象");
        }

        dnsInfo = deriveSubDNS(rawDNS);
    } catch (error) {
        warnLog(
            "[Clash_rule.js] 读取订阅 DNS 时出错（" +
                (error && error.message
                    ? error.message
                    : String(error)) +
                "），已放弃订阅 DNS，改用脚本默认配置。"
        );

        dnsInfo = deriveSubDNS(null);
    }

    const {
        subDNS,
        subNS,
        subPolicy,
        subFilter,
        carriedRuleProviders,
        proxyServerNameserver,
        proxyServerNameserverPolicy
    } = dnsInfo;

    // DNS 层 IPv6：订阅显式指定则继承，否则跟随全局 ipv6 开关
    const dnsIPv6 =
        typeof subDNS.ipv6 === "boolean"
            ? subDNS.ipv6
            : ipv6Enabled;

    params.dns = {
        enable: true,
        // 固定回环 + 非特权端口：订阅常见 0.0.0.0:53，被系统 DNS 占住会导致内核启动失败；
        // 要给局域网设备当 DNS 用时改这一行并自行确认端口与防火墙
        listen: "127.0.0.1:1053",
        ipv6: dnsIPv6,
        "prefer-h3": PREFER_H3,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        // IPv6 fake-ip 段（仅 DNS 启用 IPv6 时输出）：用官方文档段，勿用 fc00::/7 等内网段（与真实局域网冲突）
        ...(dnsIPv6
            ? { "fake-ip-range6": "fdfe:dcba:9876::/64" }
            : {}),
        "cache-algorithm": "arc",
        // 显式声明，不依赖内核默认值
        "fake-ip-filter-mode": "blacklist",
        // 保留订阅自带的 hosts 能力
        "use-hosts":
            typeof subDNS["use-hosts"] === "boolean"
                ? subDNS["use-hosts"]
                : true,
        "use-system-hosts":
            typeof subDNS["use-system-hosts"] === "boolean"
                ? subDNS["use-system-hosts"]
                : true,
        ...(isPlainObject(subDNS.hosts)
            ? { hosts: subDNS.hosts }
            : {}),
        // 前段为 real-ip 刚需：局域网、NTP、连通性探测、游戏平台（对时拿假地址会失败，连带影响 TLS 校验）
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
                "time.windows.com",
                "time.apple.com",
                // STUN 通配：域名含 stun 段的全部豁免假地址
                "+.stun.*",
                "+.stun.*.*",
                "+.stun.*.*.*",
                "+.stun.*.*.*.*",
                // 由脚本自带的规则集兜底，防手维护清单漏项
                "rule-set:cn-domain",
                "rule-set:private-domain",
                "rule-set:fakeip-filter",
                ...subFilter
            ])
        ],
        // 引导 DNS：仅解析其它 DoH 服务器域名；明文 IP 最快且不依赖证书校验（时钟不准时 DoT 证书校验会失败）
        "default-nameserver": [...CN_DNS_PLAIN],
        "proxy-server-nameserver": proxyServerNameserver,
        ...(proxyServerNameserverPolicy &&
        Object.keys(proxyServerNameserverPolicy).length > 0
            ? {
                  "proxy-server-nameserver-policy":
                      proxyServerNameserverPolicy
              }
            : {}),
        // 订阅指定了 DNS 就独占使用；否则用海外 DoH 兜底。#RULES：按路由规则出站（未匹配项经 MATCH 落主代理），与组名解耦
        nameserver: subNS.length > 0
            ? [...new Set(subNS)]
            : [
                  "https://1.1.1.1/dns-query#RULES",
                  "https://8.8.8.8/dns-query#RULES"
              ],
        // DIRECT 命中且未被 nameserver-policy 覆盖的域名（未收录 cn-domain 的冷门国内站点）用国内 DNS，避免退回主代理查海外。
        // 用纯 IP：该字段用 DoH 在部分环境会反复回退 default-nameserver 重复解析、拖高延迟
        "direct-nameserver": [...CN_DNS_PLAIN],
        // true：DIRECT 命中域名先走 nameserver-policy，未被覆盖才落到 direct-nameserver
        "direct-nameserver-follow-policy": true,
        // subPolicy 放前：不同名键保留，同名键被下面三条覆盖，不丢订阅意图也不让它盖掉脚本分流
        "nameserver-policy": Object.assign({}, subPolicy, {
            "rule-set:private-domain": ["system://"],
            "rule-set:ads-domain": ["rcode://name_error"],
            "rule-set:cn-domain": [...CN_DNS_DOH]
        })
    };

    // 远程规则集：MetaCubeX 官方拆分库，全 mrs
    const RS_BASE =
        "https://cdn.jsdmirror.com/gh/MetaCubeX/meta-rules-dat@meta/geo";

    const domainProvider = (name, interval = RS_INTERVAL) => ({
        type: "http",
        behavior: "domain",
        format: "mrs",
        url: `${RS_BASE}/geosite/${name}.mrs`,
        path: `./ruleset/geosite-${name}.mrs`,
        interval
    });

    const ipProvider = name => ({
        type: "http",
        behavior: "ipcidr",
        format: "mrs",
        url: `${RS_BASE}/geoip/${name}.mrs`,
        path: `./ruleset/geoip-${name}.mrs`,
        interval: RS_INTERVAL
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

    // 清空重建；必要的旧依赖由下方 carriedRuleProviders 搬运
    params["rule-providers"] = {};

    Object.keys(DOMAIN_SETS).forEach(key => {
        params["rule-providers"][key] =
            key === "ads-domain"
                ? domainProvider(DOMAIN_SETS[key], ADS_INTERVAL)
                : domainProvider(DOMAIN_SETS[key]);
    });

    Object.keys(IP_SETS).forEach(key => {
        params["rule-providers"][key] = ipProvider(IP_SETS[key]);
    });

    // 社区维护的 fake-ip 豁免清单（wwqgtxx/clash-rules，官方未收录），供 dns.fake-ip-filter 引用
    params["rule-providers"]["fakeip-filter"] = {
        type: "http",
        behavior: "domain",
        format: "mrs",
        url: "https://cdn.jsdmirror.com/gh/wwqgtxx/clash-rules@release/fakeip-filter.mrs",
        path: "./ruleset/fakeip-filter.mrs",
        interval: RS_INTERVAL
    };

    const hasOwn = (object, key) =>
        Object.prototype.hasOwnProperty.call(object, key);

    const renamedRS = {};

    // 并入确认必要的旧 rule-set 依赖；与自建规则集同名时订阅份改名 sub-<原名>（仍冲突加序号），
    // 并同步改写 policy 键——两处必须一致，否则 policy 指向不存在的规则集
    // type: file 的 provider 指向订阅方机器上不存在的本地文件，搬运过去内核启动即报错；
    // 这类连同其在 policy 中的 rule-set 引用一并丢弃
    const droppedCarriedRS = new Set();

    Object.keys(carriedRuleProviders).forEach(name => {
        const provider = carriedRuleProviders[name];

        if (isPlainObject(provider) && provider.type === "file") {
            droppedCarriedRS.add(name);
            return;
        }

        let finalName = name;

        if (hasOwn(params["rule-providers"], name)) {
            let suffix = 1;
            finalName = "sub-" + name;

            while (
                hasOwn(params["rule-providers"], finalName) ||
                hasOwn(carriedRuleProviders, finalName)
            ) {
                suffix++;
                finalName = "sub-" + name + "-" + suffix;
            }

            renamedRS[name] = finalName;
        }

        // 搬运的 provider 沿用订阅里的 path，可能与自建 provider 指向同一缓存文件，
        // 按各自 interval 更新时互相覆写；basename 换成 sub-<finalName>，保留原扩展名（format 未必是 mrs）
        const finalProvider = Object.assign({}, provider);

        if (
            typeof finalProvider.path === "string" &&
            finalProvider.path.length > 0
        ) {
            const segs = finalProvider.path.split("/");
            const base = segs[segs.length - 1];
            const dot = base.lastIndexOf(".");
            const ext = dot > 0 ? base.slice(dot) : "";

            segs[segs.length - 1] = "sub-" + finalName + ext;
            finalProvider.path = segs.join("/");
        }

        params["rule-providers"][finalName] = finalProvider;
    });

    if (
        (Object.keys(renamedRS).length > 0 ||
            droppedCarriedRS.size > 0) &&
        params.dns["proxy-server-nameserver-policy"]
    ) {
        const oldPolicy =
            params.dns["proxy-server-nameserver-policy"];
        const newPolicy = {};

        // 只改写 rule-set: 开头的键，其余键原样保留
        Object.keys(oldPolicy).forEach(key => {
            const names = ruleSetNames(key);

            if (names.length === 0) {
                newPolicy[key] = oldPolicy[key];
                return;
            }

            // 被丢弃的 file 类型引用从键里剔除，整条作废
            const keptNames = names.filter(
                name => !droppedCarriedRS.has(name)
            );

            if (keptNames.length === 0) return;

            const rewrittenNames = keptNames.map(
                name => renamedRS[name] || name
            );

            newPolicy[
                "rule-set:" + rewrittenNames.join(",")
            ] = oldPolicy[key];
        });

        params.dns["proxy-server-nameserver-policy"] = newPolicy;
    }

    // 仅这三类协议有 client-fingerprint 字段；hysteria2 / tuic 内核未提供该字段
    const FP_OK = ["vless", "vmess", "trojan"];

    params.proxies.forEach(proxy => {
        // 不覆盖订阅已有的取值
        if (
            proxy.type !== "direct" &&
            !("ip-version" in proxy)
        ) {
            proxy["ip-version"] = DEFAULT_IP_VERSION;
        }

        if (
            FP_OK.indexOf(proxy.type) !== -1 &&
            !proxy["client-fingerprint"]
        ) {
            const usesTLS =
                proxy.type === "trojan" ||
                proxy.tls === true ||
                proxy["reality-opts"];

            if (usesTLS) {
                proxy["client-fingerprint"] = "chrome";
            }
        }
    });

    // 上方 JS 逻辑的 provider 版本（节点运行时才出现，只能用 override 表达式），两侧判定条件必须等价
    // 用 .["client-fingerprint"] 而非 .client-fingerprint：避免 yq/jq 把连字符 '-' 误解析为减法
    const FP_EXPR =
        '(select(.type == "trojan" or ((.type == "vless" or .type == "vmess") and (.tls == true or has("reality-opts")))) | select(has("client-fingerprint") | not) | .["client-fingerprint"]) = "chrome"';

    // 规范化为表达式数组；类型非法返回 null，调用方原样保留该 provider、不做注入
    const normalizeOverrideExpr = raw => {
        if (raw === undefined || raw === null) return [];

        if (typeof raw === "string") {
            return raw.length > 0 ? [raw] : [];
        }

        if (Array.isArray(raw)) {
            if (raw.some(item => typeof item !== "string")) {
                return null;
            }

            return raw.filter(item => item.length > 0);
        }

        return null;
    };

    Object.entries(params["proxy-providers"] || {}).forEach(
        ([name, provider]) => {
            if (!provider || typeof provider !== "object") {
                return;
            }

            // 组的 url 健康检查只测 proxies 字段成员，provider 节点须靠 provider 自身的 health-check 产出延迟数据，
            // 否则地区 url-test 组拿不到延迟、永远选中第一个节点。enable 强制开启，其余项以订阅为准
            const subHealthCheck = isPlainObject(
                provider["health-check"]
            )
                ? provider["health-check"]
                : {};

            provider["health-check"] = Object.assign(
                {
                    enable: true,
                    url: TEST_URL_PROXY,
                    interval: 300,
                    timeout: 5000,
                    "expected-status": 204,
                    lazy: true
                },
                subHealthCheck,
                { enable: true }
            );

            const override = provider.override;

            if (
                override !== undefined &&
                override !== null &&
                (typeof override !== "object" ||
                    Array.isArray(override))
            ) {
                return;
            }

            const existingExpr = normalizeOverrideExpr(
                (override || {})["override-expr"]
            );

            if (existingExpr === null) return;

            // 保留上游表达式顺序；脚本指纹表达式最多出现一次（订阅每次刷新重跑本段）
            const finalExpr = existingExpr.includes(FP_EXPR)
                ? existingExpr
                : [...existingExpr, FP_EXPR];

            const mergedOverride = Object.assign(
                {},
                override || {}
            );

            if (!("ip-version" in mergedOverride)) {
                mergedOverride["ip-version"] =
                    DEFAULT_IP_VERSION;
            }

            mergedOverride["override-expr"] = finalExpr;
            provider.override = mergedOverride;
        }
    );

    const groups = [];

    // 主代理：唯一顶层入口
    groups.push({
        name: "主代理",
        type: "select",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Proxy.png",
        proxies: hasActiveRegions
            ? [
                  ...activeRegions.map(region => region.name),
                  "静态",
                  "直连"
              ]
            : ["静态", "直连"]
    });

    // 静态：收全部节点（排除 direct / reject 与信息类节点），给不想选地区的人兜底
    groups.push({
        name: "静态",
        type: "select",
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Static.png",
        "include-all": true,
        "exclude-type": "direct|reject",
        "exclude-filter": excludeFilter,
        "empty-fallback": "REJECT"
    });

    // 隐藏直连组：仅供内部选择引用；与内建 DIRECT 区分——这是名为"直连"的策略组，成员才是 DIRECT
    groups.push({
        name: "直连",
        type: "select",
        hidden: true,
        icon: "https://cdn.jsdmirror.com/gh/Koolson/Qure@63be653774a6a83cd8e475a7b65f1ed68b9a0093/IconSet/Color/Direct.png",
        proxies: ["DIRECT"]
    });

    const appProxiesList = [
        "主代理",
        "直连",
        ...activeRegions.map(region => region.name)
    ];

    // App 策略组：proxies 给切换目标，include-all 再塞入订阅节点本身，两者缺一不可
    apps.forEach(app => {
        const icon = app.icon.startsWith("http")
            ? app.icon
            : `https://cdn.jsdmirror.com/gh/shindgew/WHATSINStash@main/icon/${app.icon}`;

        groups.push({
            name: app.name,
            type: "select",
            icon,
            proxies: appProxiesList,
            "include-all": true,
            "exclude-type": "direct|reject",
            "exclude-filter": excludeFilter
        });
    });

    // 地区测速组（全隐藏）：filter 传的是 Go 正则原串，(?i) 合法
    activeRegions.forEach(region => {
        groups.push({
            name: region.name,
            type: "url-test",
            hidden: true,
            icon: region.icon,
            "include-all": true,
            "exclude-type": "direct|reject",
            filter: region.regex,
            "exclude-filter": excludeFilter,
            // provider 订阅下可能一个节点都匹配不上，用 REJECT 兜底而不是留空组
            "empty-fallback": "REJECT",
            url: TEST_URL_PROXY,
            interval: 300,
            tolerance: 30,
            lazy: true,
            timeout: 5000,
            "max-failed-times": 5,
            "expected-status": 204
        });
    });

    // 本地订阅下若全部节点被 excludeFilter 过滤，「静态」将解析为空并回落 REJECT（静默断网），
    // 转换期能确定时留一条日志；provider 订阅节点不可见，此检查覆盖不到，只能看内核日志
    if (!subHasProviders) {
        const usableCount = allProxies.filter(
            proxy => !excludeRe.test(proxy.name)
        ).length;

        if (usableCount === 0) {
            warnLog(
                "[Clash_rule.js] 订阅节点全部被 excludeFilter 过滤，「静态」组将为空并回落 REJECT，网络将不可用；请检查 excludeFilter 或节点命名。"
            );
        }
    }

    params["proxy-groups"] = groups;

    // 规则自上而下先命中先决定，顺序即优先级，四层：
    //   1. 私网 / 广告（避免内网域名被后面的规则带去代理）
    //   2. 传输层兜底（NTP、可选 QUIC 阻断；必须排在应用分流前，否则 UDP/443 被应用规则抢先）
    //   3. 应用分流
    //   4. 国内直连 → MATCH 兜底
    // cn-domain 排在 Google / Apple / Microsoft 之后：让应用分流先吃掉，避免其国内 CDN 域名被直连截胡
    params.rules = [
        "RULE-SET,private-domain,DIRECT",
        "RULE-SET,private-ip,DIRECT,no-resolve",
        "RULE-SET,ads-domain,REJECT",
        // 系统对时优先于业务分流：很多节点丢弃/限制 UDP 123，时间偏差会连带导致全局 TLS 证书校验失败
        "AND,((DST-PORT,123),(NETWORK,udp)),DIRECT",
        ...(BLOCK_QUIC
            ? [
                  "AND,((DST-PORT,443),(NETWORK,udp)),REJECT"
              ]
            : []),

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
        // no-resolve：Fake-IP 域名直接跳过，避免未收录站点进 MATCH 前被海外 nameserver 解析引入延迟
        "RULE-SET,cn-ip,DIRECT,no-resolve",

        "MATCH,主代理"
    ];

    return params;
}

if (typeof module !== "undefined") {
    module.exports = main;
    module.exports.main = main;
}

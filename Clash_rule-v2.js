// Clash_rule.js v5.3
// 注意：需较新的 mihomo 内核；首次启动需联网下载规则集，请在日志中确认全部下载成功。

// ── 可调参数（集中维护） ──
const DEFAULT_IP_VERSION = "dual"; // 节点双栈偏好：dual (并发择优) / ipv6-prefer / ipv4-prefer
const REGION_MIN_NODES = 2;        // 同地区节点数达到该值才动态建组
const RS_INTERVAL = 2592000;       // 规则集默认更新周期：一个月
const ADS_INTERVAL = 604800;       // 广告域名规则集更新周期：一周（时效性最强）
const CN_DNS_DOH = ["https://223.5.5.5/dns-query", "https://doh.pub/dns-query"];
const CN_DNS_PLAIN = ["223.5.5.5", "119.29.29.29"];
const TEST_URL_DIRECT = "http://connect.rom.miui.com/generate_204";
const TEST_URL_PROXY = "https://www.gstatic.com/generate_204";

// 客户端脚本引擎注入的 console 方法集不统一（部分引擎仅提供 log）；
// 统一经此输出警告：warn 缺失时降级 log，均缺失时静默，避免 TypeError 中断整次转换
const warnLog = (...args) => {
    if (typeof console === "undefined") return;
    if (typeof console.warn === "function") console.warn(...args);
    else if (typeof console.log === "function") console.log(...args);
};

function main(params) {
    if (!params || typeof params !== "object") params = {};
    if (!Array.isArray(params.proxies)) params.proxies = [];

    // 记录订阅自身是否使用代理集合（必须在下方覆写 rule-providers 之前读取）
    const subHasProviders = Object.keys(params["proxy-providers"] || {}).length > 0;
    // 订阅原始 rule-providers 快照（用于判断 proxy-server-nameserver-policy 里
    // 的 "rule-set:" 依赖是否确有定义；必须在下方覆写 rule-providers 之前读取）
    const subRuleProviders = Object.assign({}, params["rule-providers"] || {});

    // 客户端托管字段（mixed-port/allow-lan/mode/log-level/profile）有意不再写入：
    // 订阅扩展脚本场景下这些值会被客户端运行时配置后置覆盖，写了是冗余，
    // 且在个别不覆盖的链路上反而会在每次订阅刷新时重置用户的现场设置
    const basicOptions = {
        "unified-delay": true,
        "tcp-concurrent": true,
        "ipv6": true,
        "find-process-mode": "off",
        // TCP 保活参数（秒）：平衡移动端电量消耗与 NAT 会话活性，避免连接被中间网关静默重置
        "keep-alive-idle": 300,
        "keep-alive-interval": 30
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

    const matchedRegions = regions.filter(region => {
        const regex = toJsRegex(region.regex);
        let count = 0;
        for (const proxy of allProxies) {
            if (proxy && proxy.name && regex.test(proxy.name) && !excludeRe.test(proxy.name)) {
                count++;
                if (count >= REGION_MIN_NODES) return true;
            }
        }
        return false;
    });

    // 订阅使用代理集合时无法在脚本期得知节点内容，维持全量地区组；
    // 普通节点列表则按“同地区节点数达到 REGION_MIN_NODES”动态建组
    const activeRegions = subHasProviders ? regions : matchedRegions;
    const hasActiveRegions = activeRegions.length > 0;

    const subDNS = params.dns || {};

    // App 策略组名单与图标（供下方 OWN_GROUPS 派生与末尾组生成共用，单一来源）
    const apps = [
        { name: "AI",        icon: "openai.png" },
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

    // ── 订阅 DNS 悬空引用清洗 ──
    // 本脚本会整体重建 rule-providers 与全部策略组，订阅自带配置里指向它们的
    // rule-set:/geosite:/geoip: 引用和 "#某组名" 后缀若原样并入，内核会因找不到目标而报错。
    // geosite:/geoip: 引用还会触发内核额外下载 geo 文件，与本脚本无 geo 数据的设计冲突。
    // （脚本自己的 rule-set 引用在下方独立写入，不受此清洗影响）
    // 本脚本固定生成的组名（App 组名自动从上方 apps 数组派生，单一来源，无需手工同步）
    const OWN_GROUPS = ["主代理", "静态", "直连", ...apps.map(app => app.name)];
    // 内建策略
    const BUILTIN_POLICIES = new Set(["DIRECT", "REJECT", "REJECT-DROP", "PASS", "GLOBAL"]);
    // 地区组名：不用写死的全量地区码表，改为从上面已经算好的 activeRegions（实际会建组的地区）
    // 动态生成，避免"引用了一个因节点不足而未实际建组的地区"导致内核找不到目标策略组而崩溃
    const REGION_NAMES = new Set(activeRegions.map(region => region.name));
    // 本地可见节点名并入合法引用集：机场 DNS 用 "#具体节点名" 指定解析节点是内核支持的写法，
    // 不识别会被误剥成裸奔解析；provider 订阅在脚本期看不到节点，该集合为空、行为不变
    const PROXY_NAMES = new Set(allProxies.map(proxy => proxy && proxy.name).filter(Boolean));
    // 校验 DNS 条目尾部 "#目标" 后缀：合法则整条保留，
    // 无效（指向已被删除的组）则剥掉、该条 DNS 回落直连（安全默认）
    const refValid = ref => BUILTIN_POLICIES.has(ref)
        || OWN_GROUPS.indexOf(ref) !== -1
        || REGION_NAMES.has(ref)
        || PROXY_NAMES.has(ref);
    const stripDanglingRef = entry => {
        const s = String(entry);
        const hash = s.indexOf("#");
        if (hash === -1) return s;
        // 内核解析 fragment 的规则（config.parseNameServer）：按 "&" 分段，含 "=" 的段是
        // 参数（h3/ecs 等），不含 "=" 的段是节点/组名、最后一段生效。因此只校验生效的
        // 裸段；纯参数 fragment 不含组引用，整条保留。
        const bare = s.slice(hash + 1).split("&")
            .map(seg => seg.trim())
            .filter(seg => seg !== "" && !seg.includes("="));
        if (bare.length === 0) return s;
        return refValid(bare[bare.length - 1]) ? s : s.slice(0, hash);
    };

    const subPSN = [].concat(subDNS["proxy-server-nameserver"] || []).map(stripDanglingRef);
    const subNS = [].concat(subDNS["nameserver"] || []).map(stripDanglingRef);
    const subPolicy = Object.assign({}, subDNS["nameserver-policy"] || {});
    const subFilter = [].concat(subDNS["fake-ip-filter"] || []).filter(item =>
        !/^(rule-set|geosite|geoip):/i.test(String(item))
    );

    // ── fake-ip-filter-mode 校验 ──
    // 缺省或显式 blacklist：沿用上面的黑名单式 subFilter 继承逻辑，最终固定输出 blacklist。
    // whitelist/rule：语义（甚至 fake-ip-filter 自身语法，rule 模式下变成规则动作列表）完全不同，
    // 硬继承会反转过滤含义，因此不做猜测性转换，直接报错阻止生成，报出原值与字段路径。
    const subFilterMode = subDNS["fake-ip-filter-mode"];
    if (subFilterMode !== undefined && subFilterMode !== "blacklist") {
        throw new Error(
            `[Clash_rule.js] dns.fake-ip-filter-mode = "${subFilterMode}"：` +
            `本脚本仅支持继承 blacklist（缺省同样按 blacklist 处理）。whitelist/rule 模式下 ` +
            `fake-ip-filter 的语义和语法均不同，无法安全迁移，已阻止生成，请人工核实该字段后再处理。`
        );
    }

    for (const k of Object.keys(subPolicy)) {
        if (k === "+." || k === "*" || k === "+") { delete subPolicy[k]; continue; }    // 通吃键架空分流，丢弃
        if (/^(rule-set|geosite|geoip):/i.test(k)) { delete subPolicy[k]; continue; }    // 指向已重建的规则集/内核内建 geo 数据，丢弃
        subPolicy[k] = [].concat(subPolicy[k]).map(stripDanglingRef);                   // 值里的 "#组名" 悬空引用同样清洗
    }

    // ── 机场显式节点 DNS —— 清洗 proxy-server-nameserver-policy ──
    // 键：保留通吃键（"+."/"*"/"+"），不套用普通 nameserver-policy 那套"通吃键必须删除"的逻辑。
    //   - geosite:/geoip: 键：脚本不引入 geo 数据，无法准确迁移，明确报错阻止生成。
    //   - rule-set: 键：仅当该名字在订阅原始 rule-providers 中确有定义时，视为"必要旧依赖"保留，
    //     并把该 provider 原始定义一并带入最终 rule-providers（与脚本自身键重名则报错，不静默替换）；
    //     订阅里查不到定义的 rule-set: 键视为悬空引用，丢弃（不报错，与其它悬空引用清洗一致）。
    // 值：与其它 DNS 字段一致，用 stripDanglingRef 清洗 "#组名" 后缀。
    const rawPSNPolicy = subDNS["proxy-server-nameserver-policy"] || {};
    const subPSNPolicy = {};
    const carriedRuleProviders = {};
    for (const k of Object.keys(rawPSNPolicy)) {
        if (/^(geosite|geoip):/i.test(k)) {
            throw new Error(
                `[Clash_rule.js] dns.proxy-server-nameserver-policy 的键 "${k}" 引用 geosite/geoip，` +
                `本脚本不引入 geo 数据、无法准确迁移，已阻止生成，请人工处理该键后重试。`
            );
        }
        if (/^rule-set:/i.test(k)) {
            const rsName = k.slice("rule-set:".length);
            if (Object.prototype.hasOwnProperty.call(subRuleProviders, rsName)) {
                carriedRuleProviders[rsName] = subRuleProviders[rsName];
                subPSNPolicy[k] = [].concat(rawPSNPolicy[k]).map(stripDanglingRef);
            }
            // 订阅原始配置里查不到该 rule-provider 定义：悬空引用，丢弃
            continue;
        }
        subPSNPolicy[k] = [].concat(rawPSNPolicy[k]).map(stripDanglingRef);
    }

    const psnExplicit = subPSN.length > 0;
    let proxyServerNameserver;
    let proxyServerNameserverPolicy;

    if (psnExplicit) {
        // 机场显式设置了节点 DNS，独占使用，不混入公共 DNS
        proxyServerNameserver = [...new Set(subPSN)];
        proxyServerNameserverPolicy = subPSNPolicy;
    } else {
        // 节点 policy 按未设置处理：为它收集的旧 rule-set 依赖一并放弃，
        // 否则并入的 provider 无人引用，只会凭空多下载规则集
        for (const k of Object.keys(carriedRuleProviders)) delete carriedRuleProviders[k];
        if (Object.keys(subPSNPolicy).length > 0) {
            // 配置了节点 policy 却没有节点 nameserver：原配置里这个 policy 可能本就未生效，
            // 不能无提示激活——按未显式设置处理，走下面的迁移/兜底逻辑
            warnLog(
                "[Clash_rule.js] 订阅设置了 dns.proxy-server-nameserver-policy 但 " +
                "dns.proxy-server-nameserver 为空：该 policy 在原配置里可能并未生效，" +
                "本次不代入运行，proxy-server-nameserver-policy 按未设置处理。"
            );
        }
        // 机场未显式设置节点 DNS —— 用原普通域名解析策略作为迁移来源，
        // 避免脚本新补的公共节点 DNS 屏蔽机场专用解析
        const hasFallbackComplexity = subDNS.fallback !== undefined || subDNS["fallback-filter"] !== undefined;
        if (hasFallbackComplexity) {
            // fallback / fallback-filter 属于"路由选出 DNS 出口"的复杂行为，无法在
            // proxy-server-nameserver（单一列表）里等价表达；不拼接列表假装等价，
            // 也不静默回退公共 DNS——按无法确认的情况阻止转换并说明原因
            throw new Error(
                "[Clash_rule.js] 订阅未显式设置 dns.proxy-server-nameserver，且原配置存在 " +
                `dns.fallback${subDNS["fallback-filter"] !== undefined ? "/dns.fallback-filter" : ""}` +
                "（路由选出 DNS 出口的复杂行为），无法等价迁移到节点解析，已阻止生成，请人工核实该字段后再处理。"
            );
        } else if (subNS.length > 0 || Object.keys(subPolicy).length > 0) {
            // 普通域名解析策略/服务器按原优先关系迁入节点解析（policy 优先于 nameserver 的相对关系不变）
            proxyServerNameserver = subNS.length > 0
                ? [...new Set(subNS)]
                : [...CN_DNS_DOH];
            proxyServerNameserverPolicy = Object.keys(subPolicy).length > 0
                ? Object.assign({}, subPolicy)
                : undefined;
        } else {
            // 原配置没有任何可继承的解析信息，才使用脚本默认公共 DNS
            proxyServerNameserver = [...CN_DNS_DOH];
            proxyServerNameserverPolicy = undefined;
        }
    }

    params["dns"] = {
        "enable": true,
        "listen": "127.0.0.1:1053",
        "ipv6": subDNS["ipv6"] !== undefined ? subDNS["ipv6"] : true, // 允许解析 AAAA 记录，确保节点可获取 IPv6 地址
        "prefer-h3": true,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        // IPv6 fake-ip 段：官方示例的文档专用段；勿改用 fc00::/7 等内网保留地址，避免与真实局域网冲突
        "fake-ip-range6": "fdfe:dcba:9876::/64",
        "cache-algorithm": "arc",
        // 显式声明，不依赖内核默认值；上方已校验订阅原模式缺省/blacklist 才会走到这里
        "fake-ip-filter-mode": "blacklist",
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
        "default-nameserver": [...CN_DNS_PLAIN],
        // 机场优先、独占不混用：机场指定了节点解析 DNS 就只用机场的；
        // 没指定则走上方的迁移/兜底逻辑（见 proxyServerNameserver 计算）
        "proxy-server-nameserver": proxyServerNameserver,
        ...(proxyServerNameserverPolicy && Object.keys(proxyServerNameserverPolicy).length > 0
            ? { "proxy-server-nameserver-policy": proxyServerNameserverPolicy }
            : {}),
        // 主解析同理：机场指定了 DNS 就独占使用；否则用规则默认（走主代理隧道查询）兜底
        "nameserver": subNS.length > 0
            ? [...new Set(subNS)]
            : [
                "https://1.1.1.1/dns-query#主代理",
                "https://8.8.8.8/dns-query#主代理"
            ],
        // 规则命中 DIRECT 但未被下方 nameserver-policy 单独覆盖的域名（例如未收录进
        // cn-domain 分类的冷门国内站点）用国内 DNS 解析，避免退回 nameserver 走主代理查询海外 DNS
        // 用纯 IP 而非 DoH：该字段用 DoH 时有部分环境会反复回退到 default-nameserver 重复解析、拖高延迟
        "direct-nameserver": [...CN_DNS_PLAIN],
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
            "rule-set:cn-domain": [...CN_DNS_DOH]
        })
    };

    // 远程规则集：MetaCubeX 官方拆分库，全 mrs，默认更新周期一个月（2592000 秒）
    const RS_BASE = "https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@meta/geo";
    const domainProvider = (name, interval = RS_INTERVAL) => ({
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
        "interval": RS_INTERVAL
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
            ? domainProvider(DOMAIN_SETS[key], ADS_INTERVAL)
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
        "interval": RS_INTERVAL
    };
    // 并入 proxy-server-nameserver-policy 里确认必要的旧 rule-set 依赖
    // （carriedRuleProviders 在上方 dns 计算阶段已确认这些名字在订阅原始 rule-providers 中存在定义）
    Object.keys(carriedRuleProviders).forEach(name => {
        if (Object.prototype.hasOwnProperty.call(params["rule-providers"], name)) {
            throw new Error(
                `[Clash_rule.js] proxy-server-nameserver-policy 依赖的旧 rule-set "${name}" ` +
                `与本脚本自建的规则集同名，但内容来源不同，不能直接替换成脚本规则集，已阻止生成。`
            );
        }
        params["rule-providers"][name] = carriedRuleProviders[name];
    });

    const FP_OK = ["vless", "vmess", "trojan"];
    (params.proxies || []).forEach(proxy => {
        if (!proxy) return;
        if (proxy.type !== "direct" && !("ip-version" in proxy)) proxy["ip-version"] = DEFAULT_IP_VERSION;
        if (FP_OK.indexOf(proxy.type) !== -1 && !proxy["client-fingerprint"]) {
            const usesTLS = proxy.type === "trojan" || proxy.tls === true || proxy["reality-opts"];
            if (usesTLS) proxy["client-fingerprint"] = "chrome";
        }
    });

    // override-expr 规范化：向机场 proxy-providers 的 override-expr 补充统一的
    // client-fingerprint 表达式。使用 .["client-fingerprint"] 而非 .client-fingerprint，
    // 避免 yq/jq 把连字符 '-' 误解析为减法运算符
    const FP_EXPR = '(select(.type == "trojan" or ((.type == "vless" or .type == "vmess") and (.tls == true or has("reality-opts")))) | select(has("client-fingerprint") | not) | .["client-fingerprint"]) = "chrome"';
    const normalizeOverrideExpr = (raw, providerName) => {
        if (raw === undefined || raw === null) return [];
        if (typeof raw === "string") return raw.length > 0 ? [raw] : [];
        if (Array.isArray(raw)) {
            return raw.filter(item => {
                if (typeof item !== "string") {
                    throw new Error(
                        `[Clash_rule.js] proxy-providers.${providerName}.override.override-expr 中存在非字符串项 ` +
                        `(${JSON.stringify(item)})，已阻止生成。`
                    );
                }
                return item.length > 0;
            });
        }
        throw new Error(
            `[Clash_rule.js] proxy-providers.${providerName}.override.override-expr 类型非法 (${typeof raw})，` +
            `应为字符串或字符串数组，已阻止生成。`
        );
    };

    Object.entries(params["proxy-providers"] || {}).forEach(([name, provider]) => {
        if (provider && typeof provider === "object") {
            const existingExpr = normalizeOverrideExpr((provider.override || {})["override-expr"], name);
            // 保留原表达式顺序；只保证脚本自己的指纹表达式最多出现一次，不重排/不普遍去重上游表达式
            const finalExpr = existingExpr.includes(FP_EXPR) ? existingExpr : [...existingExpr, FP_EXPR];
            const mergedOverride = Object.assign({}, provider.override || {});
            if (!("ip-version" in mergedOverride)) mergedOverride["ip-version"] = DEFAULT_IP_VERSION;
            mergedOverride["override-expr"] = finalExpr;
            provider.override = mergedOverride;
        }
    });

    const groups = [];

    // 主代理
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
        url: TEST_URL_DIRECT
    });

    // App策略组
    const appProxiesList = [
        "主代理",
        "直连",
        ...activeRegions.map(region => `${region.name}`)
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
            "url": TEST_URL_PROXY,
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
        // 加 no-resolve，遇到 Fake-IP 域名直接跳过，避免未收录的海外冷门站点
        // 在进入 MATCH 兜底前被强行通过海外 nameserver 解析引入额外延迟，彻底保障秒开体验
        "RULE-SET,cn-ip,DIRECT,no-resolve",

        "MATCH,主代理"
    ];

    return params;
}

if (typeof module !== "undefined") {
    module.exports = main;
    module.exports.main = main;
}
// 冒烟测试：node --test
const { test } = require("node:test");
const assert = require("node:assert/strict");
const main = require("../Clash_rule.js");

const mkNode = (name, extra = {}) =>
    Object.assign(
        {
            name,
            type: "ss",
            server: "s.example.com",
            port: 443,
            cipher: "aes-128-gcm",
            password: "pw"
        },
        extra
    );

const findGroup = (out, name) =>
    out["proxy-groups"].find(group => group.name === name);

test("冲突与重名节点改名", () => {
    const out = main({
        proxies: [mkNode("主代理"), mkNode("香港 01"), mkNode("香港 01")]
    });

    const names = out.proxies.map(proxy => proxy.name);

    assert.ok(names.includes("节点·主代理"));
    assert.deepEqual(findGroup(out, "HK").proxies, ["香港 01", "香港 01·1"]);
});

test("自然排序", () => {
    const out = main({
        proxies: [mkNode("美国 10"), mkNode("美国 2"), mkNode("美国 1")]
    });

    assert.deepEqual(
        out.proxies.map(proxy => proxy.name),
        ["美国 1", "美国 2", "美国 10"]
    );
});

test("伪节点过滤，节点不足的地区不建组", () => {
    const out = main({
        proxies: [
            mkNode("香港 01"),
            mkNode("香港 02"),
            mkNode("美国 洛杉矶 1"),
            mkNode("美国 洛杉矶 10"),
            mkNode("剩余流量：10GB"),
            mkNode("官网"),
            mkNode("套餐重置：3天"),
            mkNode("香港 IEPL 专线 Expire 2026-01-01")
        ]
    });

    assert.equal(findGroup(out, "静态").proxies.length, 4);
    assert.deepEqual(findGroup(out, "HK").proxies, ["香港 01", "香港 02"]);
    assert.deepEqual(findGroup(out, "US").proxies, [
        "美国 洛杉矶 1",
        "美国 洛杉矶 10"
    ]);
    assert.ok(!out["proxy-groups"].some(group => group.name === "TW"));
});

test("10Gbps 不被误过滤", () => {
    const out = main({
        proxies: [mkNode("香港 01 10Gbps"), mkNode("香港 02 10Gbps")]
    });

    assert.equal(findGroup(out, "静态").proxies.length, 2);
});

test("指纹仅补 TLS 节点，ip-version 默认 dual", () => {
    const out = main({
        proxies: [
            mkNode("JP trojan", { type: "trojan" }),
            mkNode("JP vmess", { type: "vmess" }),
            mkNode("JP ss")
        ]
    });

    const byName = Object.fromEntries(
        out.proxies.map(proxy => [proxy.name, proxy])
    );

    assert.equal(byName["JP trojan"]["client-fingerprint"], "chrome");
    assert.equal(byName["JP vmess"]["client-fingerprint"], undefined);
    assert.equal(byName["JP ss"]["client-fingerprint"], undefined);
    assert.equal(byName["JP ss"]["ip-version"], "dual");
});

test("proxy-providers 拒绝生成", () => {
    assert.throws(
        () => main({ proxies: [], "proxy-providers": { x: { url: "u" } } }),
        /proxy-providers/
    );
});

test("空订阅：静态组为空回落 REJECT", () => {
    const out = main({ proxies: [] });

    assert.ok(out["proxy-groups"].length > 0);
    assert.deepEqual(findGroup(out, "静态").proxies, []);
    assert.equal(findGroup(out, "静态")["empty-fallback"], "REJECT");
    assert.equal(out.rules[out.rules.length - 1], "MATCH,主代理");
});

test("DNS 继承与悬空引用清洗", () => {
    const out = main({
        proxies: [mkNode("JP 1"), mkNode("JP 2")],
        dns: {
            "respect-rules": true,
            nameserver: [
                "https://dns.google/dns-query",
                "https://1.1.1.1/dns-query#失效组"
            ],
            fallback: ["8.8.8.8"],
            "nameserver-policy": {
                "+.example.com": ["https://dns.google/dns-query#JP"],
                "rule-set:ghost": ["223.5.5.5"],
                "+.": ["223.5.5.5"]
            },
            "proxy-server-nameserver": ["https://node.dns/dns-query#JP"],
            "fake-ip-filter": ["+.myiot.com", "rule-set:ghost2"],
            hosts: { "a.com": "1.2.3.4" }
        }
    });

    const dns = out.dns;

    assert.deepEqual(dns.nameserver, [
        "https://1.1.1.1/dns-query#RULES",
        "https://8.8.8.8/dns-query#RULES"
    ]);
    assert.deepEqual(dns["proxy-server-nameserver"], [
        "https://node.dns/dns-query"
    ]);

    const policyKeys = Object.keys(dns["nameserver-policy"]);
    assert.ok(policyKeys.includes("+.example.com"));
    assert.ok(!policyKeys.includes("rule-set:ghost"));
    assert.ok(!policyKeys.includes("+."));
    assert.ok(policyKeys.includes("rule-set:cn-domain"));

    assert.ok(dns["fake-ip-filter"].includes("+.myiot.com"));
    assert.ok(!dns["fake-ip-filter"].includes("rule-set:ghost2"));
    assert.ok(dns["fake-ip-filter"].includes("rule-set:cn-domain"));
    assert.deepEqual(dns.hosts, { "a.com": "1.2.3.4" });
});

test("respect-rules 时 nameserver 补 #RULES", () => {
    const withRespect = main({
        proxies: [mkNode("JP 1"), mkNode("JP 2")],
        dns: {
            "respect-rules": true,
            nameserver: ["https://dns.google/dns-query"]
        }
    });

    assert.deepEqual(withRespect.dns.nameserver, [
        "https://dns.google/dns-query#RULES"
    ]);

    const withoutRespect = main({
        proxies: [mkNode("JP 1"), mkNode("JP 2")],
        dns: { nameserver: ["https://dns.google/dns-query"] }
    });

    assert.deepEqual(withoutRespect.dns.nameserver, [
        "https://dns.google/dns-query"
    ]);
});

test("fake-ip-range6 按需输出", () => {
    const on = main({ proxies: [], ipv6: true });

    assert.equal(on.ipv6, true);
    assert.equal(on.dns["fake-ip-range6"], "fdfe:dcba:9876::/64");
    assert.equal(on.dns.ipv6, true);

    const off = main({ proxies: [] });

    assert.equal(off.ipv6, false);
    assert.equal("fake-ip-range6" in off.dns, false);
});

test("规则顺序：广告先于应用分流，MATCH 兜底", () => {
    const out = main({ proxies: [mkNode("HK 1"), mkNode("HK 2")] });
    const rules = out.rules;

    assert.ok(
        rules.indexOf("RULE-SET,ads-domain,REJECT") <
            rules.indexOf("RULE-SET,google-domain,Google")
    );
    assert.ok(
        rules.indexOf("RULE-SET,cn-domain,DIRECT") <
            rules.indexOf("MATCH,主代理")
    );
});

test("rule-set 引用均有定义", () => {
    const out = main({ proxies: [mkNode("HK 1"), mkNode("HK 2")] });
    const providers = Object.keys(out["rule-providers"]);

    for (const rule of out.rules) {
        const match = /^RULE-SET,([^,]+)/.exec(rule);
        if (match) {
            assert.ok(providers.includes(match[1]), match[1]);
        }
    }

    for (const item of out.dns["fake-ip-filter"]) {
        const match = /^rule-set:(.+)$/i.exec(item);
        if (match) {
            assert.ok(providers.includes(match[1]), match[1]);
        }
    }

    for (const key of Object.keys(out.dns["nameserver-policy"])) {
        const match = /^rule-set:(.+)$/i.exec(key);
        if (match) {
            for (const name of match[1].split(",")) {
                assert.ok(providers.includes(name.trim()), name.trim());
            }
        }
    }
});

export function findRuleByUrl(rules, url) {
    const target = `|${url}`;
    for (const rule of rules) {
        if (rule.condition.urlFilter === target) {
            return rule;
        }
    }
    return null;
}

export function findRuleIdByUrl(rules, url) {
    const rule = findRuleByUrl(rules, url);
    return rule ? rule.id : 0;
}

export async function get_site2Code() {
    const rules = await chrome.declarativeNetRequest.getDynamicRules();
    const dict = {};
    for (const rule of rules) {
        const url = rule.condition.urlFilter.slice(1);
        const matched = rule.action.responseHeaders[0].value.match(/charset=(\S+)/);
        if (matched) {
            dict[url] = matched[1];
        }
    }    
    return dict;
}

export function composeRule(ruleId, url, charset) {
    return {
        id: ruleId,
        priority: 1,
        action: {
            type: "modifyHeaders",
            responseHeaders: [{ 
                header: "content-type", 
                operation: "set", 
                value: `text/html; charset=${charset}`
            }]
        },
        condition: {
            urlFilter: `|${url}`,
            resourceTypes: ["main_frame", "sub_frame", "script"]
        }
    };
}
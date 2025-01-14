import { LocaleKey } from "@/src/i18n/locales";
import { HeaderRule } from "./config";

// 获取语言显示文本
export const getLocaleDisplayText = (locale: LocaleKey): string => {
  const localeTexts: Record<LocaleKey, string> = {
    "zh-CN": "简体中文",
    "zh-TW": "繁體中文",
    ja: "日本語",
    ko: "한국어",
    "en-US": "English",
  };
  return localeTexts[locale];
};

export const applyHeaderRules = async (rules: HeaderRule[]) => {
  const enabledRules = rules.filter((rule) => rule.enabled);

  // 获取现有规则
  const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
  const oldRuleIds = oldRules.map((rule) => rule.id);

  // 移除旧的 header 规则
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: oldRuleIds,
  });

  // 添加新规则
  const newRules = enabledRules
    .map((rule, index) => {
      const requestHeaders =
        rule.type === "request"
          ? Object.entries(rule.headers).map(([header, value]) => ({
              header,
              operation: "set" as chrome.declarativeNetRequest.HeaderOperation,
              value,
            }))
          : undefined;

      const responseHeaders =
        rule.type === "response"
          ? Object.entries(rule.headers).map(([header, value]) => ({
              header,
              operation: "set" as chrome.declarativeNetRequest.HeaderOperation,
              value,
            }))
          : undefined;

      return {
        id: index + 1000,
        priority: 1,
        action: {
          type: "modifyHeaders" as chrome.declarativeNetRequest.RuleActionType,
          ...(requestHeaders && requestHeaders.length > 0
            ? { requestHeaders }
            : {}),
          ...(responseHeaders && responseHeaders.length > 0
            ? { responseHeaders }
            : {}),
        },
        condition: {
          urlFilter: rule.url,
          resourceTypes: [
            "main_frame",
            "sub_frame",
            "script",
            "xmlhttprequest",
            "other",
          ] as chrome.declarativeNetRequest.ResourceType[],
        },
      };
    })
    .filter((rule) => {
      const reqHeaders = rule.action.requestHeaders;
      const resHeaders = rule.action.responseHeaders;
      return (
        (reqHeaders && reqHeaders.length > 0) ||
        (resHeaders && resHeaders.length > 0)
      );
    });

  if (newRules.length > 0) {
    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: newRules,
    });
  }

  console.log(
    "update header rules:",
    await chrome.declarativeNetRequest.getDynamicRules()
  );
};

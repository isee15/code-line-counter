import { useState, useEffect } from "react";
import "./App.css";
import CodeMirror from "@uiw/react-codemirror";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { t, setLocale, getLocale, initLocale } from "../../src/i18n/locales";
import type { LocaleKey } from "../../src/i18n/locales";
import {
  DEFAULT_TEMPLATES,
  DEFAULT_RULES,
  DEFAULT_HEADER_RULES,
} from "../config/config";
import type { StyleSheet, ResourceRule, HeaderRule } from "../config/config";
import { applyHeaderRules, getLocaleDisplayText } from "../config/storage";

export default function App() {
  const [styleSheets, setStyleSheets] = useState<StyleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<StyleSheet | null>(null);
  const [status, setStatus] = useState("");
  const [rules, setRules] = useState<ResourceRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ResourceRule | null>(null);
  const [locale, setCurrentLocale] = useState<LocaleKey>(getLocale());
  const [headerRules, setHeaderRules] = useState<HeaderRule[]>([]);
  const [currentPanel, setCurrentPanel] = useState<
    "style" | "resource" | "header"
  >("style");
  const [selectedHeaderRule, setSelectedHeaderRule] =
    useState<HeaderRule | null>(null);
  const [headerType, setHeaderType] = useState<"request" | "response">(
    "request"
  );

  // 初始化
  useEffect(() => {
    // 初始化语言设置
    initLocale().then(() => {
      setCurrentLocale(getLocale());
    });

    // 加载样式表和规则
    chrome.storage.local.get("stylus-sheets").then((result) => {
      const savedStyles = result["stylus-sheets"];
      if (savedStyles) {
        setStyleSheets(savedStyles);
      } else {
        // 首次使用时加载预设模板
        setStyleSheets(DEFAULT_TEMPLATES);
        chrome.storage.local.set({ "stylus-sheets": DEFAULT_TEMPLATES });
      }
    });

    // 加载资源规则
    chrome.storage.local.get("resource-rules").then((result) => {
      const savedRules = result["resource-rules"] || [];
      // 确保默认规则存在
      const mergedRules = [...DEFAULT_RULES];

      // 添加用户自定义规则
      for (const rule of savedRules) {
        if (!DEFAULT_RULES.find((defaultRule) => defaultRule.id === rule.id)) {
          mergedRules.push(rule);
        } else {
          const existingRule = mergedRules.find((r) => r.id === rule.id);
          if (existingRule) {
            existingRule.enabled = rule.enabled;
          }
        }
      }

      setRules(mergedRules);
      // 保存合并后的规则
      chrome.storage.local.set({ "resource-rules": mergedRules });
    });

    // 加载 header 规则
    chrome.storage.local.get("header-rules").then((result) => {
      const savedRules = result["header-rules"];
      if (savedRules) {
        setHeaderRules(savedRules);
      } else {
        setHeaderRules(DEFAULT_HEADER_RULES);
        chrome.storage.local.set({ "header-rules": DEFAULT_HEADER_RULES });
      }
    });
  }, []);

  const handleSave = async () => {
    try {
      if (!selectedSheet) return;

      const updatedSheets = styleSheets.map((sheet) =>
        sheet.id === selectedSheet.id ? selectedSheet : sheet
      );
      setStyleSheets(updatedSheets);

      // 保存到 chrome.storage.local
      await chrome.storage.local.set({ "stylus-sheets": updatedSheets });

      // 获取当前标签页并发送消息
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: "UPDATE_STYLES",
          styles: updatedSheets,
        });
        setStatus("样式已保存并应用");
      }
    } catch (error: unknown) {
      setStatus(`保存失败：${(error as Error).message}`);
    }
  };

  const handleToggleSheet = async (sheetId: string) => {
    const updatedSheets = styleSheets.map((sheet) =>
      sheet.id === sheetId ? { ...sheet, enabled: !sheet.enabled } : sheet
    );
    setStyleSheets(updatedSheets);

    // 保存到 chrome.storage.local
    await chrome.storage.local.set({ "stylus-sheets": updatedSheets });

    if (selectedSheet?.id === sheetId) {
      setSelectedSheet({ ...selectedSheet, enabled: !selectedSheet.enabled });
    }

    // 通知content script更新样式
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "UPDATE_STYLES",
      });
    }
  };

  const handleAddNew = async () => {
    const newSheet: StyleSheet = {
      id: `sheet-${Date.now()}`,
      name: "新样式表",
      css: "",
      enabled: true,
    };
    const updatedSheets = [...styleSheets, newSheet];
    setStyleSheets(updatedSheets);
    await chrome.storage.local.set({ "stylus-sheets": updatedSheets });
    setSelectedSheet(newSheet);
  };

  const handleDelete = async (sheetId: string) => {
    const updatedSheets = styleSheets.filter((sheet) => sheet.id !== sheetId);
    setStyleSheets(updatedSheets);
    await chrome.storage.local.set({ "stylus-sheets": updatedSheets });
    if (selectedSheet?.id === sheetId) {
      setSelectedSheet(null);
    }
  };

  const handleSheetSelect = (sheet: StyleSheet) => {
    setSelectedSheet(sheet);
  };

  // 资源规则相关函数
  const saveRules = async (updatedRules: ResourceRule[]) => {
    await chrome.storage.local.set({ "resource-rules": updatedRules });
    chrome.runtime.sendMessage({ type: "UPDATE_RULES" });
    setRules(updatedRules);
  };

  const handleRuleSelect = (rule: ResourceRule) => {
    setSelectedRule(selectedRule?.id === rule.id ? null : rule);
  };

  const updateSelectedRule = (updates: Partial<ResourceRule>) => {
    if (!selectedRule) return;
    const updatedRule = { ...selectedRule, ...updates };
    saveRules(
      rules.map((rule) => (rule.id === selectedRule.id ? updatedRule : rule))
    );
    setSelectedRule(updatedRule);
  };

  const toggleRule = (id: string) => {
    saveRules(
      rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleAddRule = () => {
    const newRule: ResourceRule = {
      id: Date.now().toString(),
      enabled: true,
      url: "",
      contentType: "application/javascript",
      type: "block",
      name: "新规则",
    };
    saveRules([...rules, newRule]);
    setSelectedRule(newRule);
  };

  const saveHeaderRules = async (updatedRules: HeaderRule[]) => {
    await chrome.storage.local.set({ "header-rules": updatedRules });
    setHeaderRules(updatedRules);
    applyHeaderRules(updatedRules);
  };

  const renderHeaderRules = () => {
    return (
      <div className="rules-container">
        <aside className="rules-sidebar">
          <div className="header-type-selector">
            <button
              className={headerType === "request" ? "active" : ""}
              onClick={() => setHeaderType("request")}
            >
              {t("header.request")}
            </button>
            <button
              className={headerType === "response" ? "active" : ""}
              onClick={() => setHeaderType("response")}
            >
              {t("header.response")}
            </button>
          </div>
          <div className="rule-list">
            {headerRules
              .filter((rule) => rule.type === headerType)
              .map((rule) => (
                <div
                  key={rule.id}
                  className={`rule-card ${
                    selectedHeaderRule?.id === rule.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedHeaderRule(rule)}
                >
                  <div className="rule-card-header">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => {
                          const updatedRules = headerRules.map((r) =>
                            r.id === rule.id
                              ? { ...r, enabled: e.target.checked }
                              : r
                          );
                          saveHeaderRules(updatedRules);
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <div className="rule-info">
                      <span className="rule-title">{rule.name}</span>
                      <span className="rule-url">{rule.url}</span>
                    </div>
                  </div>
                </div>
              ))}
            <button
              className="create-button"
              onClick={() => {
                const newRule: HeaderRule = {
                  id: `header-${Date.now()}`,
                  enabled: false,
                  url: ".*",
                  type: headerType,
                  headers: {},
                  name: t("header.newRule"),
                };
                setHeaderRules([...headerRules, newRule]);
                setSelectedHeaderRule(newRule);
              }}
            >
              <span className="icon">+</span>
              {t("header.newRule")}
            </button>
          </div>
        </aside>

        {selectedHeaderRule && (
          <section className="editor-section">
            <div className="form-group">
              <label htmlFor="header-name">{t("header.ruleName")}</label>
              <input
                id="header-name"
                type="text"
                value={selectedHeaderRule.name}
                onChange={(e) => {
                  const updatedRule = {
                    ...selectedHeaderRule,
                    name: e.target.value,
                  };
                  setSelectedHeaderRule(updatedRule);
                  const updatedRules = headerRules.map((r) =>
                    r.id === updatedRule.id ? updatedRule : r
                  );
                  saveHeaderRules(updatedRules);
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="header-url">{t("header.urlPattern")}</label>
              <input
                id="header-url"
                type="text"
                value={selectedHeaderRule.url}
                onChange={(e) => {
                  const updatedRule = {
                    ...selectedHeaderRule,
                    url: e.target.value,
                  };
                  setSelectedHeaderRule(updatedRule);
                  const updatedRules = headerRules.map((r) =>
                    r.id === updatedRule.id ? updatedRule : r
                  );
                  saveHeaderRules(updatedRules);
                }}
                placeholder={t("header.urlPatternPlaceholder")}
              />
            </div>
            <div className="form-group">
              <label>{t("header.headers")}</label>
              <div className="headers-list">
                {Object.entries(selectedHeaderRule.headers).map(
                  ([key, value]) => (
                    <div key={key} className="header-item">
                      <input
                        type="text"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = {
                            ...selectedHeaderRule.headers,
                          };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          const updatedRule = {
                            ...selectedHeaderRule,
                            headers: newHeaders,
                          };
                          setSelectedHeaderRule(updatedRule);
                          const updatedRules = headerRules.map((r) =>
                            r.id === updatedRule.id ? updatedRule : r
                          );
                          saveHeaderRules(updatedRules);
                        }}
                        placeholder={t("header.headerName")}
                      />
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                          const updatedRule = {
                            ...selectedHeaderRule,
                            headers: {
                              ...selectedHeaderRule.headers,
                              [key]: e.target.value,
                            },
                          };
                          setSelectedHeaderRule(updatedRule);
                          const updatedRules = headerRules.map((r) =>
                            r.id === updatedRule.id ? updatedRule : r
                          );
                          saveHeaderRules(updatedRules);
                        }}
                        placeholder={t("header.headerValue")}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newHeaders = {
                            ...selectedHeaderRule.headers,
                          };
                          delete newHeaders[key];
                          const updatedRule = {
                            ...selectedHeaderRule,
                            headers: newHeaders,
                          };
                          setSelectedHeaderRule(updatedRule);
                          const updatedRules = headerRules.map((r) =>
                            r.id === updatedRule.id ? updatedRule : r
                          );
                          saveHeaderRules(updatedRules);
                        }}
                        className="delete-button"
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
                <button
                  type="button"
                  onClick={() => {
                    const updatedRule = {
                      ...selectedHeaderRule,
                      headers: {
                        ...selectedHeaderRule.headers,
                        "": "",
                      },
                    };
                    setSelectedHeaderRule(updatedRule);
                    const updatedRules = headerRules.map((r) =>
                      r.id === updatedRule.id ? updatedRule : r
                    );
                    saveHeaderRules(updatedRules);
                  }}
                  className="create-button"
                >
                  <span className="icon">+</span>
                  {t("header.addHeader")}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderStyleRules = () => {
    return (
      <div className="styles-panel">
        <aside className="styles-sidebar">
          <button
            type="button"
            onClick={handleAddNew}
            className="create-button"
          >
            <span className="icon">+</span>
            {t("style.newStyleSheet")}
          </button>

          <div className="style-list">
            {styleSheets.map((sheet) => (
              <div
                key={sheet.id}
                className={`style-card ${
                  selectedSheet?.id === sheet.id ? "selected" : ""
                }`}
                onClick={() => handleSheetSelect(sheet)}
              >
                <div className="style-card-header">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={sheet.enabled}
                      onChange={() => handleToggleSheet(sheet.id)}
                    />
                    <span className="toggle-slider" />
                  </label>
                  <span className="style-name">{sheet.name}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(sheet.id);
                  }}
                  className="delete-button"
                  title={t("common.delete")}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </aside>

        {selectedSheet && (
          <section className="editor-container">
            <div className="editor-header">
              <input
                type="text"
                value={selectedSheet.name}
                onChange={(e) =>
                  setSelectedSheet({
                    ...selectedSheet,
                    name: e.target.value,
                  })
                }
                className="sheet-name-input"
                placeholder={t("style.enterStyleName")}
              />
            </div>

            <div className="editor-wrapper">
              <CodeMirror
                value={selectedSheet.css}
                height="100%"
                theme={vscodeDark}
                extensions={[css()]}
                onChange={(value: string) =>
                  setSelectedSheet({
                    ...selectedSheet,
                    css: value,
                  })
                }
              />
            </div>

            <div className="editor-footer">
              <button
                type="button"
                onClick={handleSave}
                className={`save-button ${
                  !selectedSheet.enabled ? "disabled" : ""
                }`}
                disabled={!selectedSheet.enabled}
              >
                {t("style.saveStyle")}
              </button>
              {status && <div className="status-message">{status}</div>}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderResourceRules = () => {
    return (
      <div className="rules-container">
        <aside className="rules-sidebar">
          <button
            type="button"
            onClick={handleAddRule}
            className="create-button"
          >
            <span className="icon">+</span>
            {t("rule.newRule")}
          </button>
          <div className="rule-list">
            {rules.map((rule) => {
              const isBuiltin = DEFAULT_RULES.find((r) => r.id === rule.id);
              return (
                <div
                  key={rule.id}
                  className={`rule-card ${
                    selectedRule?.id === rule.id ? "selected" : ""
                  }`}
                  onClick={() => handleRuleSelect(rule)}
                  data-builtin={isBuiltin ? "true" : "false"}
                >
                  <div className="rule-card-header">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleRule(rule.id);
                        }}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <div className="rule-info">
                      <span className="rule-title" title={rule.name}>
                        {rule.name || t("rule.unnamed")}
                      </span>
                      {rule.url && (
                        <span className="rule-url" title={rule.url}>
                          {rule.url}
                        </span>
                      )}
                    </div>
                  </div>
                  {!isBuiltin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedRules = rules.filter(
                          (r) => r.id !== rule.id
                        );
                        saveRules(updatedRules);
                      }}
                      className="delete-button"
                      title={t("common.delete")}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {selectedRule && (
          <section className="editor-section">
            {selectedRule.description && (
              <div className="rule-description">
                <p>{selectedRule.description}</p>
              </div>
            )}
            {selectedRule.id === "vconsole" ? (
              <div className="form-group">
                <p>{t("rule.vConsoleDescription")}</p>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="rule-url">{t("rule.urlPattern")}</label>
                  <input
                    id="rule-url"
                    type="text"
                    value={selectedRule.url}
                    onChange={(e) =>
                      updateSelectedRule({ url: e.target.value })
                    }
                    placeholder={t("rule.urlPatternPlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rule-content-type">
                    {t("rule.contentType")}
                  </label>
                  <select
                    id="rule-content-type"
                    value={selectedRule.contentType}
                    onChange={(e) =>
                      updateSelectedRule({ contentType: e.target.value })
                    }
                  >
                    <option value="application/javascript">
                      {t("contentTypes.javascript")}
                    </option>
                    <option value="text/html">{t("contentTypes.html")}</option>
                    <option value="text/css">{t("contentTypes.css")}</option>
                    <option value="application/json">
                      {t("contentTypes.json")}
                    </option>
                    <option value="text/plain">{t("contentTypes.text")}</option>
                    <option value="image/*">{t("contentTypes.image")}</option>
                    <option value="application/xml">
                      {t("contentTypes.xml")}
                    </option>
                    <option value="application/x-www-form-urlencoded">
                      {t("contentTypes.formData")}
                    </option>
                    <option value="*/*">{t("contentTypes.all")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="rule-type">{t("rule.ruleType")}</label>
                  <select
                    id="rule-type"
                    value={selectedRule.type}
                    onChange={(e) =>
                      updateSelectedRule({
                        type: e.target.value as ResourceRule["type"],
                      })
                    }
                  >
                    <option value="block">{t("rule.blockResource")}</option>
                    <option value="modify">{t("rule.modifyContent")}</option>
                    <option value="inject">{t("rule.injectFunction")}</option>
                  </select>
                </div>

                {selectedRule.type === "modify" && (
                  <div className="form-group">
                    <label htmlFor="rule-content">
                      {t("rule.replacementContent")}
                      <span className="label-hint">
                        {t("rule.replacementContentHint")}
                      </span>
                    </label>
                    <div className="example-block">
                      <p>{t("rule.examples.title")}</p>
                      <ul>
                        <li>
                          {t("rule.examples.replaceJS")}：
                          <code>console.log('已被修改');</code>
                        </li>
                        <li>
                          {t("rule.examples.replaceCSS")}：
                          <code>{`body { background: #fff !important; }`}</code>
                        </li>
                        <li>
                          {t("rule.examples.replaceHTML")}：
                          <code>&lt;div&gt;已被修改&lt;/div&gt;</code>
                        </li>
                        <li>
                          {t("rule.examples.replaceJSON")}：
                          <code>{`{"message": "已被修改"}`}</code>
                        </li>
                      </ul>
                    </div>
                    <textarea
                      id="rule-content"
                      value={selectedRule.content || ""}
                      onChange={(e) =>
                        updateSelectedRule({ content: e.target.value })
                      }
                      placeholder={t("rule.enterContent")}
                    />
                  </div>
                )}

                {selectedRule.type === "inject" && (
                  <div className="form-group">
                    <label htmlFor="rule-function">
                      {t("rule.injectionFunction")}
                      <span className="label-hint">
                        {t("rule.injectionFunctionHint")}
                      </span>
                    </label>
                    <div className="example-block">
                      <p>{t("rule.examples.title")}</p>
                      <ul>
                        <li>
                          <p>{t("rule.examples.modifyElements")}：</p>
                          <pre>{`function() {
const elements = document.querySelectorAll('.ad-banner');
elements.forEach(el => el.style.display = 'none');
}`}</pre>
                        </li>
                        <li>
                          <p>{t("rule.examples.injectScript")}：</p>
                          <pre>{`function() {
const script = document.createElement('script');
script.textContent = 'console.log("注入的脚本已执行");';
document.head.appendChild(script);
}`}</pre>
                        </li>
                        <li>
                          <p>{t("rule.examples.listenEvents")}：</p>
                          <pre>{`function() {
window.addEventListener('load', () => {
console.log('页面加载完成');
});
}`}</pre>
                        </li>
                      </ul>
                    </div>
                    <CodeMirror
                      value={selectedRule.function || ""}
                      height="100%"
                      theme={vscodeDark}
                      extensions={[javascript()]}
                      onChange={(value: string) =>
                        updateSelectedRule({ function: value })
                      }
                    />
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">{t("app.title")}</h1>
          <select
            value={locale}
            onChange={(e) => {
              const newLocale = e.target.value as LocaleKey;
              setLocale(newLocale);
              setCurrentLocale(newLocale);
            }}
            className="language-select"
            title={t("app.switchLanguage")}
          >
            <option value="zh-CN">{getLocaleDisplayText("zh-CN")}</option>
            <option value="zh-TW">{getLocaleDisplayText("zh-TW")}</option>
            <option value="ja">{getLocaleDisplayText("ja")}</option>
            <option value="ko">{getLocaleDisplayText("ko")}</option>
            <option value="en-US">{getLocaleDisplayText("en-US")}</option>
          </select>
        </div>
        <nav className="tab-nav">
          <button
            type="button"
            className={`tab-button ${currentPanel === "style" ? "active" : ""}`}
            onClick={() => {
              setCurrentPanel("style");
            }}
          >
            <span className="icon">🎨</span>
            {t("app.styleManager")}
          </button>
          <button
            type="button"
            className={`tab-button ${
              currentPanel === "resource" ? "active" : ""
            }`}
            onClick={() => {
              setCurrentPanel("resource");
            }}
          >
            <span className="icon">⚙️</span>
            {t("app.resourceManager")}
          </button>
          <button
            type="button"
            className={`tab-button ${
              currentPanel === "header" ? "active" : ""
            }`}
            onClick={() => {
              setCurrentPanel("header");
            }}
          >
            <span className="icon">📝</span>
            Headers
          </button>
        </nav>
      </header>

      <main className="app-content">
        {currentPanel === "style" && renderStyleRules()}

        {currentPanel === "resource" && renderResourceRules()}

        {currentPanel === "header" && renderHeaderRules()}
      </main>
    </div>
  );
}

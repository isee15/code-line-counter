import { DEFAULT_RULES } from "../../config/config";
import type { ResourceRule } from "../../config/config";
import { javascript } from "@codemirror/lang-javascript";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { t } from "@/src/i18n/locales";
export default function Index() {
  const [rules, setRules] = useState<ResourceRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ResourceRule | null>(null);
  const [editingRule, setEditingRule] = useState<ResourceRule | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleRuleSelect = (rule: ResourceRule) => {
    if (selectedRule?.id === rule.id) {
      setSelectedRule(null);
      setEditingRule(null);
    } else {
      setSelectedRule(rule);
      setEditingRule({ ...rule });
    }
  };

  // 资源规则相关函数
  const saveRules = async (updatedRules: ResourceRule[]) => {
    try {
      // 保存到 storage
      await chrome.storage.local.set({ "resource-rules": updatedRules });
      setRules(updatedRules);
      
      // 通知 background 更新规则
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        
        if (tab?.id && tab.url && !tab.url.startsWith('chrome://')) {
          try {
            await chrome.runtime.sendMessage({ type: "UPDATE_RULES" });
            setStatus(t("common.saved"));
          } catch (error) {
            // 如果后台脚本未运行，记录错误但不影响保存
            console.error('Failed to notify background script:', error);
            setStatus(t("common.savedWithoutApply"));
          }
        } else {
          // 如果是chrome://页面或特殊页面，只保存不应用
          setStatus(t("common.savedWithoutApply"));
        }
      } catch (error) {
        // 如果出现错误，至少保存了更改
        setStatus(t("common.savedWithoutApply"));
      }
      
      // 3秒后清除状态消息
      setTimeout(() => setStatus(""), 3000);
    } catch (error: unknown) {
      setStatus(`${t("common.saveFailed")}: ${(error as Error).message}`);
    }
  };

  const handleSave = () => {
    if (!editingRule || !selectedRule) return;
    const updatedRules = rules.map((rule) =>
      rule.id === selectedRule.id ? editingRule : rule
    );
    saveRules(updatedRules);
    setSelectedRule(editingRule);
  };

  const updateEditingRule = (updates: Partial<ResourceRule>) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, ...updates });
  };

  const toggleRule = async (id: string) => {
    try {
      const updatedRules = rules.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      );
      await saveRules(updatedRules);
      
      if (selectedRule?.id === id) {
        setSelectedRule(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
        setEditingRule(prev => prev ? { ...prev, enabled: !prev.enabled } : null);
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleAddRule = async () => {
    const newRule: ResourceRule = {
      id: Date.now().toString(),
      enabled: true,
      url: "",
      contentType: "application/javascript",
      type: "block",
      name: "新规则",
    };
    await saveRules([...rules, newRule]);
    setSelectedRule(newRule);
    setEditingRule(newRule);
  };

  useEffect(() => {
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
  }, []);
  return (
    <div className="rules-container">
      <aside className="rules-sidebar">
        <button type="button" onClick={handleAddRule} className="create-button">
          <span className="icon">+</span>
          {t("rule.newRule")}
        </button>
        <div className="rule-list">
          {rules.map((rule) => {
            const isBuiltin = DEFAULT_RULES.find((r) => r.id === rule.id);
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
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

      {selectedRule && editingRule && (
        <section className="editor-container">
          <div className="editor-header">
            <input
              type="text"
              value={editingRule.name}
              onChange={(e) => updateEditingRule({ name: e.target.value })}
              className="sheet-name-input"
              placeholder={t("rule.unnamed")}
            />
          </div>

          <div className="editor-wrapper">
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
                    value={editingRule.url}
                    onChange={(e) => updateEditingRule({ url: e.target.value })}
                    placeholder={t("rule.urlPatternPlaceholder")}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rule-content-type">
                    {t("rule.contentType")}
                  </label>
                  <select
                    id="rule-content-type"
                    value={editingRule.contentType}
                    onChange={(e) =>
                      updateEditingRule({ contentType: e.target.value })
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
                    value={editingRule.type}
                    onChange={(e) =>
                      updateEditingRule({
                        type: e.target.value as ResourceRule["type"],
                      })
                    }
                  >
                    <option value="block">{t("rule.blockResource")}</option>
                    <option value="modify">{t("rule.modifyContent")}</option>
                    <option value="inject">{t("rule.injectFunction")}</option>
                  </select>
                </div>

                {editingRule.type === "modify" && (
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
                          <code>{"body { background: #fff !important; }"}</code>
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
                      value={editingRule.content || ""}
                      onChange={(e) =>
                        updateEditingRule({ content: e.target.value })
                      }
                      placeholder={t("rule.enterContent")}
                    />
                  </div>
                )}

                {editingRule.type === "inject" && (
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
                      value={editingRule.function || ""}
                      height="100%"
                      theme={vscodeDark}
                      extensions={[javascript()]}
                      onChange={(value: string) =>
                        updateEditingRule({ function: value })
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="editor-footer">
            <button
              type="button"
              onClick={handleSave}
              className={`save-button ${
                !editingRule.enabled ? "disabled" : ""
              }`}
              disabled={!editingRule.enabled}
            >
              {t("common.save")}
            </button>
            {status && <div className="status-message">{status}</div>}
          </div>
        </section>
      )}
    </div>
  );
}

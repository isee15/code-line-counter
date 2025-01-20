import { DEFAULT_HEADER_RULES } from "../../config/config";
import type { HeaderRule } from "../../config/config";
import { t } from "@/src/i18n/locales";
import { applyHeaderRules } from "../../config/storage";

export default function Index() {
  const [headerRules, setHeaderRules] = useState<HeaderRule[]>([]);
  const [selectedHeaderRule, setSelectedHeaderRule] = useState<HeaderRule | null>(null);
  const [editingRule, setEditingRule] = useState<HeaderRule | null>(null);
  const [headerType, setHeaderType] = useState<"request" | "response">("request");
  const [status, setStatus] = useState("");

  const saveHeaderRules = async (updatedRules: HeaderRule[]) => {
    try {
      // 保存到 storage
      await chrome.storage.local.set({ "header-rules": updatedRules });
      setHeaderRules(updatedRules);
      applyHeaderRules(updatedRules);
      
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

  const handleSave = async () => {
    try {
      if (!editingRule || !selectedHeaderRule) return;
      const updatedRules = headerRules.map((rule) =>
        rule.id === selectedHeaderRule.id ? editingRule : rule
      );
      await saveHeaderRules(updatedRules);
      setSelectedHeaderRule(editingRule);
    } catch (error: unknown) {
      setStatus(`${t("common.saveFailed")}: ${(error as Error).message}`);
    }
  };

  const handleRuleSelect = (rule: HeaderRule) => {
    if (selectedHeaderRule?.id === rule.id) {
      setSelectedHeaderRule(null);
      setEditingRule(null);
    } else {
      setSelectedHeaderRule(rule);
      setEditingRule({ ...rule });
    }
  };

  const updateEditingRule = (updates: Partial<HeaderRule>) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, ...updates });
  };

  const handleAddHeader = () => {
    if (!editingRule) return;
    updateEditingRule({
      headers: {
        ...editingRule.headers,
        "": "",
      },
    });
  };

  const handleDeleteHeader = (key: string) => {
    if (!editingRule) return;
    const newHeaders = { ...editingRule.headers };
    delete newHeaders[key];
    updateEditingRule({ headers: newHeaders });
  };

  const handleUpdateHeaderKey = (oldKey: string, newKey: string) => {
    if (!editingRule) return;
    const newHeaders = { ...editingRule.headers };
    const value = newHeaders[oldKey];
    delete newHeaders[oldKey];
    newHeaders[newKey] = value;
    updateEditingRule({ headers: newHeaders });
  };

  const handleUpdateHeaderValue = (key: string, value: string) => {
    if (!editingRule) return;
    updateEditingRule({
      headers: {
        ...editingRule.headers,
        [key]: value,
      },
    });
  };

  const handleToggleRule = async (rule: HeaderRule) => {
    try {
      const updatedRules = headerRules.map((r) =>
        r.id === rule.id ? { ...r, enabled: !r.enabled } : r
      );
      await saveHeaderRules(updatedRules);
      
      if (selectedHeaderRule?.id === rule.id) {
        setSelectedHeaderRule({ ...rule, enabled: !rule.enabled });
        setEditingRule({ ...rule, enabled: !rule.enabled });
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleAddRule = () => {
    const newRule: HeaderRule = {
      id: `header-${Date.now()}`,
      enabled: true,
      url: ".*",
      type: headerType,
      headers: {},
      name: t("header.newRule"),
    };
    setHeaderRules([...headerRules, newRule]);
    setSelectedHeaderRule(newRule);
    setEditingRule(newRule);
  };

  useEffect(() => {
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

  return (
    <div className="rules-container">
      <aside className="rules-sidebar">
        <div className="header-type-selector">
          <button
            type="button"
            className={headerType === "request" ? "active" : ""}
            onClick={() => setHeaderType("request")}
          >
            {t("header.request")}
          </button>
          <button
            type="button"
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
              // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
              <div
                key={rule.id}
                className={`rule-card ${
                  selectedHeaderRule?.id === rule.id ? "selected" : ""
                }`}
                onClick={() => handleRuleSelect(rule)}
              >
                <div className="rule-card-header">
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleRule(rule);
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
          <button type="button" onClick={handleAddRule} className="create-button">
            <span className="icon">+</span>
            {t("header.newRule")}
          </button>
        </div>
      </aside>

      {selectedHeaderRule && editingRule && (
        <section className="editor-container">
          <div className="editor-header">
            <input
              type="text"
              value={editingRule.name}
              onChange={(e) => updateEditingRule({ name: e.target.value })}
              className="sheet-name-input"
              placeholder={t("header.ruleName")}
            />
          </div>

          <div className="editor-wrapper">
            <div className="form-group">
              <label htmlFor="header-url">{t("header.urlPattern")}</label>
              <input
                id="header-url"
                type="text"
                value={editingRule.url}
                onChange={(e) => updateEditingRule({ url: e.target.value })}
                placeholder={t("header.urlPatternPlaceholder")}
              />
            </div>

            <div className="form-group">
              <label id="headers-label">{t("header.headers")}</label>
              <div className="headers-list" aria-labelledby="headers-label">
                {Object.entries(editingRule.headers).map(([key, value]) => (
                  <div key={key} className="header-item">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => handleUpdateHeaderKey(key, e.target.value)}
                      placeholder={t("header.headerName")}
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleUpdateHeaderValue(key, e.target.value)}
                      placeholder={t("header.headerValue")}
                    />
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDeleteHeader(key)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddHeader}
                  className="create-button"
                >
                  <span className="icon">+</span>
                  {t("header.addHeader")}
                </button>
              </div>
            </div>
          </div>

          <div className="editor-footer">
            <button
              type="button"
              onClick={handleSave}
              className={`save-button ${!editingRule.enabled ? "disabled" : ""}`}
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

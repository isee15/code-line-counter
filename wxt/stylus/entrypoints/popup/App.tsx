import { useState, useEffect } from "react";
import "./App.css";
import { t, setLocale, getLocale, initLocale } from "../../src/i18n/locales";
import type { LocaleKey } from "../../src/i18n/locales";

import { Upload, Download } from "lucide-react";
import StyleRulesPanel from "./components/StyleRulesPanel";
import ResourceRulesPanel from "./components/ResourceRulesPanel";
import HeaderRulesPanel from "./components/HeaderRulesPanel";
import { getLocaleDisplayText } from "../config/storage";

export default function App() {
  const [locale, setCurrentLocale] = useState<LocaleKey>(getLocale());

  const [currentPanel, setCurrentPanel] = useState<
    "style" | "resource" | "header"
  >("style");

  const [status, setStatus] = useState("");

  // 初始化
  useEffect(() => {
    // 初始化语言设置
    initLocale().then(() => {
      setCurrentLocale(getLocale());
    });
  }, []);

  const renderHeaderRules = () => {
    return <HeaderRulesPanel />;
  };

  const renderStyleRules = () => {
    return <StyleRulesPanel />;
  };

  const renderResourceRules = () => {
    return <ResourceRulesPanel />;
  };

  // 导出配置
  const handleExportConfig = async () => {
    const savedConfig = await chrome.storage.local.get([
      "stylus-sheets",
      "resource-rules",
      "header-rules",
    ]);
    const config = {
      styleSheets: savedConfig["stylus-sheets"],
      rules: savedConfig["resource-rules"],
      headerRules: savedConfig["header-rules"],
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stylus-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入配置
  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string);
        // 保存到 chrome.storage.local
        await chrome.storage.local.set({
          "stylus-sheets": importedConfig.styleSheets || [],
          "resource-rules": importedConfig.rules || [],
          "header-rules": importedConfig.headerRules || [],
        });

        // 通知 background 更新规则
        chrome.runtime.sendMessage({ type: "UPDATE_RULES" });

        // 通知当前标签页更新样式
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: "UPDATE_STYLES",
            styles: importedConfig.styleSheets || [],
          });
        }

        setStatus(t("common.importSuccess"));
      } catch (error) {
        setStatus(t("common.importError"));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="app-title">{t("app.title")}</h1>
          </div>
          
          <div className="header-right">
            <button
              onClick={handleExportConfig}
              className="toolbar-button"
              type="button"
              title={t("common.export")}
            >
              <Download size={16} />
              {t("common.export")}
            </button>
            
            <label className="toolbar-button import-label" title={t("common.import")}>
              <Upload size={16} />
              {t("common.import")}
              <input
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                className="import-input"
                aria-label="Import configuration"
              />
            </label>

            <select
              value={locale}
              onChange={(e) => {
                const newLocale = e.target.value as LocaleKey;
                setLocale(newLocale);
                setCurrentLocale(newLocale);
              }}
              className="toolbar-button"
              title={t("app.switchLanguage")}
            >
              <option value="zh-CN">{getLocaleDisplayText("zh-CN")}</option>
              <option value="zh-TW">{getLocaleDisplayText("zh-TW")}</option>
              <option value="ja">{getLocaleDisplayText("ja")}</option>
              <option value="ko">{getLocaleDisplayText("ko")}</option>
              <option value="en-US">{getLocaleDisplayText("en-US")}</option>
            </select>
          </div>
        </div>
        
        <nav className="tab-nav">
          <button
            type="button"
            className={`tab-button ${currentPanel === "style" ? "active" : ""}`}
            onClick={() => {
              setCurrentPanel("style");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") setCurrentPanel("style");
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
            onKeyDown={(e) => {
              if (e.key === "Enter") setCurrentPanel("resource");
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
            onKeyDown={(e) => {
              if (e.key === "Enter") setCurrentPanel("header");
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

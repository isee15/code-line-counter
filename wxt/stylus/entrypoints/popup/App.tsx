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
          <a 
            href="https://github.com/isee15/code-line-counter/tree/main/wxt/stylus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="app-link"
            style={{
              marginLeft: 'auto',
              color: '#1890ff',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="GitHub"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ display: 'block' }}
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            GitHub
          </a>
          <a 
            href="https://billcat.cn/gmjz/#download" 
            target="_blank" 
            rel="noopener noreferrer"
            className="app-link"
            style={{
              color: '#1890ff',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <img 
              src="icon/114.png" 
              alt="乖猫记账图标" 
              style={{
                width: '16px',
                height: '16px',
                verticalAlign: 'middle',
              }}
            />
            乖猫记账
          </a>
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

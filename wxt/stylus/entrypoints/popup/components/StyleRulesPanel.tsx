import {
  getLocalizedDefaultTemplates,
  localizeStyleSheet,
} from "../../config/config";
import { css } from "@codemirror/lang-css";
import type { StyleSheet } from "../../config/config";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { t } from "@/src/i18n/locales";
import { useState, useEffect } from "react";

export default function Index() {
  const [styleSheets, setStyleSheets] = useState<StyleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<StyleSheet | null>(null);
  const [status, setStatus] = useState("");
  const localizedSelectedSheet = selectedSheet
    ? localizeStyleSheet(selectedSheet)
    : null;

  useEffect(() => {
    // 加载样式表和规则
    chrome.storage.local.get("stylus-sheets").then((result) => {
      const savedStyles = result["stylus-sheets"];
      if (savedStyles) {
        setStyleSheets(savedStyles.map(localizeStyleSheet));
      } else {
        // 首次使用时加载预设模板
        const defaultTemplates = getLocalizedDefaultTemplates();
        setStyleSheets(defaultTemplates);
        chrome.storage.local.set({ "stylus-sheets": defaultTemplates });
      }
    });
  }, []); // Added dependency array to prevent infinite loop
  
  const handleAddNew = async () => {
    const newSheet: StyleSheet = {
      id: `sheet-${Date.now()}`,
      name: "新样式表",
      css: "",
      enabled: true,
      url: "", // Add URL property
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

  const handleSave = async () => {
    try {
      if (!selectedSheet) return;

      const normalizedSelectedSheet = localizeStyleSheet(selectedSheet);

      const updatedSheets = styleSheets.map((sheet) =>
        sheet.id === normalizedSelectedSheet.id
          ? normalizedSelectedSheet
          : localizeStyleSheet(sheet)
      );
      setStyleSheets(updatedSheets);

      // 保存到 chrome.storage.local
      await chrome.storage.local.set({ "stylus-sheets": updatedSheets });

      // 获取当前标签页并发送消息
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        
        if (tab?.id && tab.url && !tab.url.startsWith('chrome://')) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "UPDATE_STYLES",
              styles: updatedSheets,
            });
            setStatus(t("common.saved"));
          } catch (msgError) {
            console.log("Error sending message to content script:", msgError);
            // 如果消息发送失败，说明content script可能未加载，尝试注入
            try {
              // Use the correct path to the content script relative to extension root
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['/content-scripts/content.js']  // Updated path to match WXT structure
              });
              // 重试发送消息
              await chrome.tabs.sendMessage(tab.id, {
                type: "UPDATE_STYLES",
                styles: updatedSheets,
              });
              setStatus(t("common.saved"));
            } catch (injectionError) {
              console.error("Failed to inject content script:", injectionError);
              setStatus(t("common.savedWithoutApply"));
            }
          }
        } else {
          // 如果是chrome://页面或特殊页面，只保存不应用
          setStatus(t("common.savedWithoutApply"));
        }
      } catch (error) {
        console.log("Error sending message to content script:", error);
        // 如果出现错误，至少保存了更改
        setStatus(t("common.savedWithoutApply"));
      }
    } catch (error: unknown) {
      setStatus(`${t("common.saveFailed")}: ${(error as Error).message}`);
    }

    // 3秒后清除状态消息
    setTimeout(() => setStatus(""), 3000);
  };

  const handleToggleSheet = async (sheetId: string) => {
    const updatedSheets = styleSheets.map((sheet) =>
      localizeStyleSheet(
        sheet.id === sheetId ? { ...sheet, enabled: !sheet.enabled } : sheet
      )
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

  return (
    <div className="styles-panel">
      <aside className="styles-sidebar">
        <button type="button" onClick={handleAddNew} className="create-button">
          <span className="icon">+</span>
          {t("style.newStyleSheet")}
        </button>

        <div className="style-list">
          {styleSheets.map((sheet) => {
            const localizedSheet = localizeStyleSheet(sheet);
            return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
            <div
              key={localizedSheet.id}
              className={`style-card ${
                selectedSheet?.id === localizedSheet.id ? "selected" : ""
              }`}
              onClick={() => handleSheetSelect(localizedSheet)}
            >
              <div className="style-card-header">
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={localizedSheet.enabled}
                    onChange={() => handleToggleSheet(localizedSheet.id)}
                  />
                  <span className="toggle-slider" />
                </label>
                <div className="style-info">
                  <span className="style-name">{localizedSheet.name}</span>
                  {localizedSheet.url && (
                    <span className="style-url" title={localizedSheet.url}>
                      {localizedSheet.url}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(localizedSheet.id);
                }}
                className="delete-button"
                title={t("common.delete")}
              >
                ×
              </button>
            </div>
          );
          })}
        </div>
      </aside>

      {localizedSelectedSheet && (
        <section className="editor-container">
          <div className="editor-header">
            <input
              type="text"
              value={localizedSelectedSheet.name}
              onChange={(e) =>
                setSelectedSheet({
                  ...selectedSheet,
                  name: e.target.value,
                  nameCustomized: true,
                })
              }
              className="sheet-name-input"
              placeholder={t("style.enterStyleName")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="style-url">{t("rule.urlPattern")}</label>
            <input
              id="style-url"
              type="text"
              value={localizedSelectedSheet.url || ""}
              onChange={(e) =>
                setSelectedSheet({
                  ...selectedSheet,
                  url: e.target.value,
                })
              }
              placeholder={t("rule.urlPatternPlaceholder")}
            />
          </div>

          <div className="editor-wrapper">
            <CodeMirror
              value={localizedSelectedSheet.css}
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
}

import {
  DEFAULT_TEMPLATES} from "../../config/config";
import { css } from "@codemirror/lang-css";
import type { StyleSheet } from "../../config/config";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { t } from "@/src/i18n/locales";
export default function Index() {
  const [styleSheets, setStyleSheets] = useState<StyleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<StyleSheet | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
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
  });
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
            // 如果消息发送失败，说明content script可能未加载，尝试注入
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            // 重试发送消息
            await chrome.tabs.sendMessage(tab.id, {
              type: "UPDATE_STYLES",
              styles: updatedSheets,
            });
            setStatus(t("common.saved"));
          }
        } else {
          // 如果是chrome://页面或特殊页面，只保存不应用
          setStatus(t("common.savedWithoutApply"));
        }
      } catch (error) {
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

  return (
    <div className="styles-panel">
      <aside className="styles-sidebar">
        <button type="button" onClick={handleAddNew} className="create-button">
          <span className="icon">+</span>
          {t("style.newStyleSheet")}
        </button>

        <div className="style-list">
          {styleSheets.map((sheet) => (
            // biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
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
}

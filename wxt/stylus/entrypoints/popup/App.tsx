import { useState, useEffect } from 'react';
import './App.css';
import type { EditorView } from '@codemirror/view';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

interface StyleSheet {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  url?: string;
}

const DEFAULT_TEMPLATES: StyleSheet[] = [
  {
    id: 'dark-mode',
    name: '深色模式',
    css: `body {
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}
a {
  color: #66b3ff !important;
}`,
    enabled: false
  },
  {
    id: 'reading-mode',
    name: '阅读模式',
    css: `body {
  max-width: 800px !important;
  margin: 0 auto !important;
  padding: 20px !important;
  font-size: 18px !important;
  line-height: 1.6 !important;
}`,
    enabled: false
  },
  {
    id: 'eye-protection',
    name: '护眼模式',
    css: `/* 设置背景为护眼色 */
body {
  background-color: #c7edcc !important;
  color: #333333 !important;
}

/* 调整文本颜色和背景 */
p, div, span, li, td, th, caption, label, input, textarea {
  background-color: #c7edcc !important;
  color: #333333 !important;
}

/* 调整链接颜色 */
a {
  color: #2b5329 !important;
}

/* 调整图片亮度 */
img {
  filter: brightness(0.95) !important;
}

/* 调整代码块背景 */
pre, code {
  background-color: #b8e6be !important;
  color: #1a3318 !important;
}

/* 调整输入框背景 */
input, textarea, select {
  background-color: #d8f2dc !important;
}`,
    enabled: false
  }
];

function App() {
  const [styleSheets, setStyleSheets] = useState<StyleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<StyleSheet | null>(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // 加载保存的样式表
    const savedStyles = localStorage.getItem('stylus-sheets');
    if (savedStyles) {
      setStyleSheets(JSON.parse(savedStyles));
    } else {
      // 首次使用时加载预设模板
      setStyleSheets(DEFAULT_TEMPLATES);
    }
  }, []);

  const handleSave = async () => {
    try {
      if (!selectedSheet) return;

      const updatedSheets = styleSheets.map(sheet =>
        sheet.id === selectedSheet.id ? selectedSheet : sheet
      );
      setStyleSheets(updatedSheets);
      localStorage.setItem('stylus-sheets', JSON.stringify(updatedSheets));

      // 获取当前标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // 发送消息到content script
      if (tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_STYLES',
          styles: updatedSheets
        });
        setStatus('样式已保存并应用');
      }
    } catch (error: unknown) {
      setStatus(`保存失败：${(error as Error).message}`);
    }
  };

  const handleToggleSheet = (sheetId: string) => {
    const updatedSheets = styleSheets.map(sheet =>
      sheet.id === sheetId ? { ...sheet, enabled: !sheet.enabled } : sheet
    );
    setStyleSheets(updatedSheets);
    localStorage.setItem('stylus-sheets', JSON.stringify(updatedSheets));

    // 如果当前选中的样式表被禁用，更新编辑器
    if (selectedSheet?.id === sheetId) {
      setSelectedSheet({ ...selectedSheet, enabled: !selectedSheet.enabled });
    }

    // 通知content script更新样式
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'UPDATE_STYLES',
          styles: updatedSheets
        });
      }
    });
  };

  const handleAddNew = () => {
    const newSheet: StyleSheet = {
      id: `sheet-${Date.now()}`,
      name: '新样式表',
      css: '',
      enabled: true
    };
    setStyleSheets([...styleSheets, newSheet]);
    setSelectedSheet(newSheet);
  };

  const handleDelete = (sheetId: string) => {
    const updatedSheets = styleSheets.filter(sheet => sheet.id !== sheetId);
    setStyleSheets(updatedSheets);
    localStorage.setItem('stylus-sheets', JSON.stringify(updatedSheets));
    if (selectedSheet?.id === sheetId) {
      setSelectedSheet(null);
    }
  };

  const handleSheetSelect = (sheet: StyleSheet) => {
    setSelectedSheet(sheet);
  };

  const handleKeyPress = (event: React.KeyboardEvent, sheet: StyleSheet) => {
    if (event.key === 'Enter' || event.key === ' ') {
      handleSheetSelect(sheet);
    }
  };

  return (
    <div className="container">
      <h1>Stylus</h1>
      
      <div className="sidebar">
        <button type="button" onClick={handleAddNew} className="add-button">
          新建样式表
        </button>
        <div className="style-list">
          {styleSheets.map(sheet => (
            <div
              key={sheet.id}
              className={`style-item ${selectedSheet?.id === sheet.id ? 'selected' : ''}`}
            >
              <label className="style-name">
                <input
                  type="checkbox"
                  checked={sheet.enabled}
                  onChange={() => handleToggleSheet(sheet.id)}
                />
                <button
                  type="button"
                  onClick={() => handleSheetSelect(sheet)}
                  className="sheet-name-button"
                >
                  {sheet.name}
                </button>
              </label>
              <button
                type="button"
                onClick={() => handleDelete(sheet.id)}
                className="delete-button"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedSheet && (
        <div className="editor-section">
          <input
            type="text"
            value={selectedSheet.name}
            onChange={(e) => setSelectedSheet({
              ...selectedSheet,
              name: e.target.value
            })}
            className="style-title"
          />
          <CodeMirror
            value={selectedSheet.css}
            height="300px"
            theme={vscodeDark}
            extensions={[css()]}
            onChange={(value: string) => setSelectedSheet({
              ...selectedSheet,
              css: value
            })}
          />
          <div className="controls">
            <button
              type="button"
              onClick={handleSave}
              className="save-button"
              disabled={!selectedSheet.enabled}
            >
              保存样式
            </button>
            {status && <div className="status">{status}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import { useState, useEffect } from 'react';
import './App.css';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { t, setLocale, getLocale, initLocale } from '../../src/i18n/locales';
import type { LocaleKey } from '../../src/i18n/locales';

interface StyleSheet {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  url?: string;
}

interface ResourceRule {
  id: string;
  enabled: boolean;
  url: string;
  contentType: string;
  type: 'block' | 'modify' | 'inject';
  content?: string;
  function?: string;
  name: string;
  description?: string;
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

const DEFAULT_RULES: ResourceRule[] = [
  {
    id: 'vconsole',
    enabled: false,
    url: '.*',
    contentType: 'text/html',
    type: 'inject',
    name: 'vConsole调试面板',
    description: '在网页中注入调试工具，用于移动端调试'
  },
  {
    id: 'block-analytics',
    enabled: false,
    url: '.*(google-analytics\\.com|googletagmanager\\.com|umeng\\.com|cnzz\\.com|baidu\\.com/hm\\.js).*',
    contentType: '*/*',
    type: 'block',
    name: '拦截数据统计',
    description: '阻止常见的网站统计和分析脚本'
  },
  {
    id: 'block-ads',
    enabled: false,
    url: '.*(pagead2\\.googlesyndication\\.com|ads\\.google\\.com|adservice\\.google\\.com|doubleclick\\.net).*',
    contentType: '*/*',
    type: 'block',
    name: '拦截广告请求',
    description: '阻止常见的广告加载请求'
  },
  {
    id: 'dark-mode',
    enabled: false,
    url: '.*',
    contentType: 'text/html',
    type: 'inject',
    function: `function() {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      document.querySelectorAll('img, video, canvas').forEach(el => {
        el.style.filter = 'invert(1) hue-rotate(180deg)';
      });
    }`,
    name: '全局深色模式',
    description: '将所有网页转换为深色模式'
  },
  {
    id: 'block-social',
    enabled: false,
    url: '.*(facebook\\.com|twitter\\.com|linkedin\\.com|weibo\\.com)/.*\\.(js|html)',
    contentType: '*/*',
    type: 'block',
    name: '拦截社交组件',
    description: '阻止社交媒体分享按钮和跟踪组件'
  },
  {
    id: 'block-video-ads',
    enabled: false,
    url: '.*(doubleclick\\.net|\\.googlevideo\\.com/videoplayback\\?.*ctier=L|.*\\.com\\.\\w+/videos/other/.*)',
    contentType: '*/*',
    type: 'block',
    name: '拦截视频广告',
    description: '阻止视频网站的广告内容'
  },
  {
    id: 'reading-mode',
    enabled: false,
    url: '.*',
    contentType: 'text/html',
    type: 'inject',
    function: `function() {
      const style = document.createElement('style');
      style.textContent = \`
        body {
          max-width: 800px !important;
          margin: 0 auto !important;
          padding: 20px !important;
          font-size: 18px !important;
          line-height: 1.6 !important;
          background: #fff !important;
          color: #333 !important;
        }
        img { max-width: 100% !important; height: auto !important; }
      \`;
      document.head.appendChild(style);
    }`,
    name: '阅读模式',
    description: '优化页面布局，提供更好的阅读体验'
  },
  {
    id: 'block-cookie-notices',
    enabled: false,
    url: '.*(cookie-notice|cookie-consent|cookie-law|gdpr).*\\.(js|css)',
    contentType: '*/*',
    type: 'block',
    name: '拦截Cookie提示',
    description: '阻止烦人的Cookie政策提示框'
  },
  {
    id: 'block-chat-widgets',
    enabled: false,
    url: '.*(intercom\\.com|drift\\.com|tawk\\.to|crisp\\.chat|livechat\\.).*',
    contentType: '*/*',
    type: 'block',
    name: '拦截聊天组件',
    description: '阻止网页客服聊天窗口'
  },
  {
    id: 'anti-debugger',
    enabled: false,
    url: '.*',
    contentType: 'text/html',
    type: 'inject',
    function: `function() {
      const noop = () => {};
      Object.defineProperty(window, 'debugger', { get: noop, set: noop });
      setInterval(() => {
        const before = Date.now();
        debugger;
        const after = Date.now();
        if (after - before > 100) {
          console.log('检测到调试器暂停，已阻止');
        }
      }, 500);
    }`,
    name: '反调试保护',
    description: '阻止网页的反调试措施'
  }
];

export default function App() {
  const [styleSheets, setStyleSheets] = useState<StyleSheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<StyleSheet | null>(null);
  const [status, setStatus] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [rules, setRules] = useState<ResourceRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ResourceRule | null>(null);
  const [locale, setCurrentLocale] = useState<LocaleKey>(getLocale());

  // 初始化
  useEffect(() => {
    // 初始化语言设置
    initLocale().then(() => {
      setCurrentLocale(getLocale());
    });

    // 加载样式表和规则
    chrome.storage.local.get('stylus-sheets').then(result => {
      const savedStyles = result['stylus-sheets'];
      if (savedStyles) {
        setStyleSheets(savedStyles);
      } else {
        // 首次使用时加载预设模板
        setStyleSheets(DEFAULT_TEMPLATES);
        chrome.storage.local.set({ 'stylus-sheets': DEFAULT_TEMPLATES });
      }
    });

    // 加载资源规则
    chrome.storage.local.get('resource-rules').then((result) => {
      const savedRules = result['resource-rules'] || [];
      // 确保默认规则存在
      const mergedRules = [...DEFAULT_RULES];
      
      // 添加用户自定义规则
      for (const rule of savedRules) {
        if (!DEFAULT_RULES.find(defaultRule => defaultRule.id === rule.id)) {
          mergedRules.push(rule);
        } else {
          const existingRule = mergedRules.find(r => r.id === rule.id);
          if (existingRule) {
            existingRule.enabled = rule.enabled;
          }
        }
      }

      setRules(mergedRules);
      // 保存合并后的规则
      chrome.storage.local.set({ 'resource-rules': mergedRules });
    });
  }, []);

  // 切换语言
  const toggleLocale = () => {
    // 定义语言循环顺序
    const localeOrder: LocaleKey[] = ['zh-CN', 'zh-TW', 'ja', 'ko', 'en-US'];
    const currentIndex = localeOrder.indexOf(locale);
    const nextIndex = (currentIndex + 1) % localeOrder.length;
    const newLocale = localeOrder[nextIndex];
    setLocale(newLocale);
    setCurrentLocale(newLocale);
  };

  // 获取语言显示文本
  const getLocaleDisplayText = (locale: LocaleKey): string => {
    const localeTexts: Record<LocaleKey, string> = {
      'zh-CN': '简体中文',
      'zh-TW': '繁體中文',
      'ja': '日本語',
      'ko': '한국어',
      'en-US': 'English'
    };
    return localeTexts[locale];
  };

  const handleSave = async () => {
    try {
      if (!selectedSheet) return;

      const updatedSheets = styleSheets.map(sheet =>
        sheet.id === selectedSheet.id ? selectedSheet : sheet
      );
      setStyleSheets(updatedSheets);
      
      // 保存到 chrome.storage.local
      await chrome.storage.local.set({ 'stylus-sheets': updatedSheets });

      // 获取当前标签页并发送消息
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
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

  const handleToggleSheet = async (sheetId: string) => {
    const updatedSheets = styleSheets.map(sheet =>
      sheet.id === sheetId ? { ...sheet, enabled: !sheet.enabled } : sheet
    );
    setStyleSheets(updatedSheets);
    
    // 保存到 chrome.storage.local
    await chrome.storage.local.set({ 'stylus-sheets': updatedSheets });

    if (selectedSheet?.id === sheetId) {
      setSelectedSheet({ ...selectedSheet, enabled: !selectedSheet.enabled });
    }

    // 通知content script更新样式
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'UPDATE_STYLES'
      });
    }
  };

  const handleAddNew = async () => {
    const newSheet: StyleSheet = {
      id: `sheet-${Date.now()}`,
      name: '新样式表',
      css: '',
      enabled: true
    };
    const updatedSheets = [...styleSheets, newSheet];
    setStyleSheets(updatedSheets);
    await chrome.storage.local.set({ 'stylus-sheets': updatedSheets });
    setSelectedSheet(newSheet);
  };

  const handleDelete = async (sheetId: string) => {
    const updatedSheets = styleSheets.filter(sheet => sheet.id !== sheetId);
    setStyleSheets(updatedSheets);
    await chrome.storage.local.set({ 'stylus-sheets': updatedSheets });
    if (selectedSheet?.id === sheetId) {
      setSelectedSheet(null);
    }
  };

  const handleSheetSelect = (sheet: StyleSheet) => {
    setSelectedSheet(sheet);
  };

  // 资源规则相关函数
  const saveRules = async (updatedRules: ResourceRule[]) => {
    await chrome.storage.local.set({ 'resource-rules': updatedRules });
    chrome.runtime.sendMessage({ type: 'UPDATE_RULES' });
    setRules(updatedRules);
  };

  const handleRuleSelect = (rule: ResourceRule) => {
    setSelectedRule(selectedRule?.id === rule.id ? null : rule);
  };

  const updateSelectedRule = (updates: Partial<ResourceRule>) => {
    if (!selectedRule) return;
    const updatedRule = { ...selectedRule, ...updates };
    saveRules(rules.map(rule => 
      rule.id === selectedRule.id ? updatedRule : rule
    ));
    setSelectedRule(updatedRule);
  };

  const toggleRule = (id: string) => {
    saveRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleAddRule = () => {
    const newRule: ResourceRule = {
      id: Date.now().toString(),
      enabled: true,
      url: '',
      contentType: 'application/javascript',
      type: 'block',
      name: '新规则'
    };
    saveRules([...rules, newRule]);
    setSelectedRule(newRule);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">{t('app.title')}</h1>
          <select
            value={locale}
            onChange={(e) => {
              const newLocale = e.target.value as LocaleKey;
              setLocale(newLocale);
              setCurrentLocale(newLocale);
            }}
            className="language-select"
            title={t('app.switchLanguage')}
          >
            <option value="zh-CN">{getLocaleDisplayText('zh-CN')}</option>
            <option value="zh-TW">{getLocaleDisplayText('zh-TW')}</option>
            <option value="ja">{getLocaleDisplayText('ja')}</option>
            <option value="ko">{getLocaleDisplayText('ko')}</option>
            <option value="en-US">{getLocaleDisplayText('en-US')}</option>
          </select>
        </div>
        <nav className="tab-nav">
          <button 
            type="button"
            className={`tab-button ${!showRules ? 'active' : ''}`}
            onClick={() => setShowRules(false)}
          >
            <span className="icon">🎨</span>
            {t('app.styleManager')}
          </button>
          <button 
            type="button"
            className={`tab-button ${showRules ? 'active' : ''}`}
            onClick={() => setShowRules(true)}
          >
            <span className="icon">⚙️</span>
            {t('app.resourceManager')}
          </button>
        </nav>
      </header>

      <main className="app-content">
        {!showRules ? (
          <div className="styles-panel">
            <aside className="styles-sidebar">
              <button 
                type="button" 
                onClick={handleAddNew} 
                className="create-button"
              >
                <span className="icon">+</span>
                {t('style.newStyleSheet')}
              </button>
              
              <div className="style-list">
                {styleSheets.map(sheet => (
                  <div
                    key={sheet.id}
                    className={`style-card ${selectedSheet?.id === sheet.id ? 'selected' : ''}`}
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
                      title={t('common.delete')}
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
                    onChange={(e) => setSelectedSheet({
                      ...selectedSheet,
                      name: e.target.value
                    })}
                    className="sheet-name-input"
                    placeholder={t('style.enterStyleName')}
                  />
                </div>
                
                <div className="editor-wrapper">
                  <CodeMirror
                    value={selectedSheet.css}
                    height="100%"
                    theme={vscodeDark}
                    extensions={[css()]}
                    onChange={(value: string) => setSelectedSheet({
                      ...selectedSheet,
                      css: value
                    })}
                  />
                </div>

                <div className="editor-footer">
                  <button
                    type="button"
                    onClick={handleSave}
                    className={`save-button ${!selectedSheet.enabled ? 'disabled' : ''}`}
                    disabled={!selectedSheet.enabled}
                  >
                    {t('style.saveStyle')}
                  </button>
                  {status && <div className="status-message">{status}</div>}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="rules-container">
            <aside className="rules-sidebar">
              <button 
                type="button" 
                onClick={handleAddRule} 
                className="create-button"
              >
                <span className="icon">+</span>
                {t('rule.newRule')}
              </button>
              <div className="rule-list">
                {rules.map(rule => {
                  const isBuiltin = DEFAULT_RULES.find(r => r.id === rule.id);
                  return (
                    <div
                      key={rule.id}
                      className={`rule-card ${selectedRule?.id === rule.id ? 'selected' : ''}`}
                      onClick={() => handleRuleSelect(rule)}
                      data-builtin={isBuiltin ? 'true' : 'false'}
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
                          <span 
                            className="rule-title" 
                            title={rule.name}
                          >
                            {rule.name || t('rule.unnamed')}
                          </span>
                          {rule.url && (
                            <span 
                              className="rule-url"
                              title={rule.url}
                            >
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
                            const updatedRules = rules.filter(r => r.id !== rule.id);
                            saveRules(updatedRules);
                          }}
                          className="delete-button"
                          title={t('common.delete')}
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
                {selectedRule.id === 'vconsole' ? (
                  <div className="form-group">
                    <p>{t('rule.vConsoleDescription')}</p>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label htmlFor="rule-url">{t('rule.urlPattern')}</label>
                      <input
                        id="rule-url"
                        type="text"
                        value={selectedRule.url}
                        onChange={e => updateSelectedRule({ url: e.target.value })}
                        placeholder={t('rule.urlPatternPlaceholder')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="rule-content-type">{t('rule.contentType')}</label>
                      <select
                        id="rule-content-type"
                        value={selectedRule.contentType}
                        onChange={e => updateSelectedRule({ contentType: e.target.value })}
                      >
                        <option value="application/javascript">{t('contentTypes.javascript')}</option>
                        <option value="text/html">{t('contentTypes.html')}</option>
                        <option value="text/css">{t('contentTypes.css')}</option>
                        <option value="application/json">{t('contentTypes.json')}</option>
                        <option value="text/plain">{t('contentTypes.text')}</option>
                        <option value="image/*">{t('contentTypes.image')}</option>
                        <option value="application/xml">{t('contentTypes.xml')}</option>
                        <option value="application/x-www-form-urlencoded">{t('contentTypes.formData')}</option>
                        <option value="*/*">{t('contentTypes.all')}</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="rule-type">{t('rule.ruleType')}</label>
                      <select
                        id="rule-type"
                        value={selectedRule.type}
                        onChange={e => updateSelectedRule({ type: e.target.value as ResourceRule['type'] })}
                      >
                        <option value="block">{t('rule.blockResource')}</option>
                        <option value="modify">{t('rule.modifyContent')}</option>
                        <option value="inject">{t('rule.injectFunction')}</option>
                      </select>
                    </div>

                    {selectedRule.type === 'modify' && (
                      <div className="form-group">
                        <label htmlFor="rule-content">
                          {t('rule.replacementContent')}
                          <span className="label-hint">{t('rule.replacementContentHint')}</span>
                        </label>
                        <div className="example-block">
                          <p>{t('rule.examples.title')}</p>
                          <ul>
                            <li>{t('rule.examples.replaceJS')}：<code>console.log('已被修改');</code></li>
                            <li>{t('rule.examples.replaceCSS')}：<code>{`body { background: #fff !important; }`}</code></li>
                            <li>{t('rule.examples.replaceHTML')}：<code>&lt;div&gt;已被修改&lt;/div&gt;</code></li>
                            <li>{t('rule.examples.replaceJSON')}：<code>{`{"message": "已被修改"}`}</code></li>
                          </ul>
                        </div>
                        <textarea
                          id="rule-content"
                          value={selectedRule.content || ''}
                          onChange={e => updateSelectedRule({ content: e.target.value })}
                          placeholder={t('rule.enterContent')}
                        />
                      </div>
                    )}

                    {selectedRule.type === 'inject' && (
                      <div className="form-group">
                        <label htmlFor="rule-function">
                          {t('rule.injectionFunction')}
                          <span className="label-hint">{t('rule.injectionFunctionHint')}</span>
                        </label>
                        <div className="example-block">
                          <p>{t('rule.examples.title')}</p>
                          <ul>
                            <li>
                              <p>{t('rule.examples.modifyElements')}：</p>
                              <pre>{`function() {
  const elements = document.querySelectorAll('.ad-banner');
  elements.forEach(el => el.style.display = 'none');
}`}</pre>
                            </li>
                            <li>
                              <p>{t('rule.examples.injectScript')}：</p>
                              <pre>{`function() {
  const script = document.createElement('script');
  script.textContent = 'console.log("注入的脚本已执行");';
  document.head.appendChild(script);
}`}</pre>
                            </li>
                            <li>
                              <p>{t('rule.examples.listenEvents')}：</p>
                              <pre>{`function() {
  window.addEventListener('load', () => {
    console.log('页面加载完成');
  });
}`}</pre>
                            </li>
                          </ul>
                        </div>
                        <textarea
                          id="rule-function"
                          value={selectedRule.function || ''}
                          onChange={e => updateSelectedRule({ function: e.target.value })}
                          placeholder={t('rule.enterFunction')}
                        />
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}


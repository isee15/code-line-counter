interface StyleSheet {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  url?: string;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // 为每个样式表创建一个style元素
    const styleElements: Record<string, HTMLStyleElement> = {};

    // 从localStorage获取并应用CSS
    const applyStyles = () => {
      const savedStyles = localStorage.getItem('stylus-sheets');
      if (!savedStyles) return;

      const styleSheets: StyleSheet[] = JSON.parse(savedStyles);
      
      // 清理已删除的样式表
      Object.keys(styleElements).forEach(id => {
        if (!styleSheets.find(sheet => sheet.id === id)) {
          styleElements[id].remove();
          delete styleElements[id];
        }
      });

      // 应用或更新样式表
      styleSheets.forEach(sheet => {
        if (!sheet.enabled) {
          // 如果样式表被禁用，移除对应的style元素
          if (styleElements[sheet.id]) {
            styleElements[sheet.id].remove();
            delete styleElements[sheet.id];
          }
          return;
        }

        // 如果存在URL匹配模式且不匹配当前页面，跳过
        if (sheet.url && !location.href.match(new RegExp(sheet.url))) {
          return;
        }

        // 创建或更新style元素
        if (!styleElements[sheet.id]) {
          const element = document.createElement('style');
          element.id = `stylus-${sheet.id}`;
          document.head.appendChild(element);
          styleElements[sheet.id] = element;
        }
        styleElements[sheet.id].textContent = sheet.css;
      });
    };

    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'UPDATE_STYLES') {
        localStorage.setItem('stylus-sheets', JSON.stringify(message.styles));
        applyStyles();
      }
    });

    // 初始应用样式
    applyStyles();
  },
});

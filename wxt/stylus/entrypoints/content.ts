interface StyleSheet {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  url?: string;
}

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    const styleElements: Record<string, HTMLStyleElement> = {};

    const applyStyles = async () => {
      // 从 chrome.storage.local 获取样式
      const result = await chrome.storage.local.get("stylus-sheets");
      const styleSheets: StyleSheet[] = result["stylus-sheets"] || [];

      // 使用 for...of 替代 forEach
      for (const id of Object.keys(styleElements)) {
        if (!styleSheets.find((sheet) => sheet.id === id)) {
          styleElements[id].remove();
          delete styleElements[id];
        }
      }

      // 应用样式
      for (const sheet of styleSheets) {
        if (!sheet.enabled) {
          if (styleElements[sheet.id]) {
            styleElements[sheet.id].remove();
            delete styleElements[sheet.id];
          }
          continue;
        }

        if (sheet.url && !location.href.match(new RegExp(sheet.url))) {
          continue;
        }

        if (!styleElements[sheet.id]) {
          const element = document.createElement("style");
          element.id = `stylus-${sheet.id}`;
          document.head.appendChild(element);
          styleElements[sheet.id] = element;
        }
        styleElements[sheet.id].textContent = sheet.css;
      }
    };

    // 监听来自popup的消息
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "UPDATE_STYLES") {
        applyStyles();
      } else if (message.action === "showAlert") {
        alert(message.message);
      }
    });

    // 初始应用样式
    applyStyles();
  },
});

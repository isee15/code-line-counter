interface StyleSheet {
  id: string;
  name: string;
  css: string;
  enabled: boolean;
  url?: string;
}

function switchCharset(charset: string) {
  console.log("切换字符集到:", charset);

  // 防止重复切换
  if (sessionStorage.getItem("charset-switched") === charset) {
    console.log("字符集已经切换过，无需重复切换:", charset);
    return;
  }

  const meta = document.querySelector(
    'meta[charset], meta[http-equiv="Content-Type"]'
  );

  if (meta) {
    if (
      meta.hasAttribute("charset") &&
      meta.getAttribute("charset") === charset
    ) {
      console.log("当前字符集已经是目标字符集:", charset);
      return;
    }

    if (!meta.hasAttribute("charset")) {
      const currentCharset = meta
        ?.getAttribute("content")
        ?.match(/charset=(.+)/i)?.[1];
      if (currentCharset === charset) {
        console.log("当前字符集已经是目标字符集:", charset);
        return;
      }
    }
  }

  // 添加或修改 meta 标签
  if (!meta) {
    console.log("添加新的 meta charset 标签");
    const newMeta = document.createElement("meta");
    newMeta.setAttribute("charset", charset);
    document.head.appendChild(newMeta);
  } else {
    console.log("更新 meta charset 属性");
    if (meta.hasAttribute("charset")) {
      meta.setAttribute("charset", charset);
    } else {
      meta.setAttribute("content", `text/html; charset=${charset}`);
    }
  }

  // 保存状态并重新加载页面
  sessionStorage.setItem("charset-switched", charset);
  location.reload();
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

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "switchCharset") {
        switchCharset(request.charset);
      }
    });
  },
});

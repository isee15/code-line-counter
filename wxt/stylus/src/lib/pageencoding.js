export const PageEncoding = (() => {
  // 某Tab的编码都暂存一下，这是prefix
  const ENCODING_PREFIX = "FE_ENCODING_PREFIX_";
  let listenerAddedFlag = false;
  let contextMenuId = null;

  const resetEncoding = [["default", "默认/重置"]];

  // 系统支持的编码列表
  const SystemCharsetList = [
    ["UTF-8", "Unicode（UTF-8）"],
    ["GBK", "简体中文（GBK）"],
    ["GB3212", "简体中文（GB3212）"],
    ["GB18030", "简体中文（GB18030）"],
    ["Big5", "繁体中文（Big5）"],
    ["UTF-16LE", "Unicode（UTF-16LE）"],
    ["EUC-KR", "韩文（EUC-KR）"],
    ["Shift_JIS", "日文（Shift_JIS）"],
    ["EUC-JP", "日文（EUC-JP）"],
    ["ISO-2022-JP", "日文（ISO-2022-JP）"],
    ["Windows-874", "泰文（Windows-874）"],
    ["Windows-1254", "土耳其文（Windows-1254）"],
    ["ISO-8859-7", "希腊文（ISO-8859-7）"],
    ["Windows-1253", "希腊文（Windows-1253）"],
    ["Windows-1252", "西文（Windows-1252）"],
    ["ISO-8859-15", "西文（ISO-8859-15）"],
    ["Macintosh", "西文（Macintosh）"],
    ["Windows-1258", "越南文（Windows-1258）"],
    ["ISO-8859-2", "中欧文（ISO-8859-2）"],
    ["Windows-1250", "中欧文（Windows-1250）"],
  ];

  // 菜单列表
  let menuMap = {};

  /**
   * 创建右键菜单
   */
  const createMenu = () => {
    console.log("createMenu");
    contextMenuId = chrome.contextMenus.create({
      title: "page-charset",
      id: "page-charset",
      contexts: ["all"],
      documentUrlPatterns: ["http://*/*", "https://*/*", "file://*/*"],
    });

    chrome.contextMenus.create({
      contexts: ["all"],
      title: "检测当前网页字符集",
      id: "page-charset-check",
      parentId: contextMenuId,
    });

    chrome.contextMenus.create({
      type: "separator",
      id: "page-charset-separator",
      parentId: contextMenuId,
    });

    // 如果已经在设置页重新设置过字符集，这里则做一个覆盖，负责还原为默认
    const encodingList = Array.from(SystemCharsetList);

    for (const item of resetEncoding.concat(encodingList)) {
      menuMap[item[0].toUpperCase()] = chrome.contextMenus.create({
        type: "radio",
        contexts: ["all"],
        id: `page-charset-${item[0]}`,
        title:
          item[0] === resetEncoding[0][0] ? resetEncoding[0][1] : `${item[1]}`,
        checked: false,
        parentId: contextMenuId,
      });
    }
  };

  /**
   * 更新菜单的选中状态
   * @param tabId
   */
  const updateMenu = (tabId) => {
    // 选中它该选中的
    const storageKey = ENCODING_PREFIX + tabId;
    chrome.storage.local.get(storageKey, (result) => {
      const encoding = result[storageKey] || "";
      const menuId = menuMap[encoding.toUpperCase()];

      for (const menu of Object.keys(menuMap)) {
        chrome.contextMenus.update(menuMap[menu], {
          checked: menuMap[menu] === menuId,
        });
      }
    });
  };

  /**
   * web请求截获，修改字符集
   */
  const addOnlineSiteEncodingListener = async (callback) => {
    listenerAddedFlag = true;

    // 标签被关闭时的检测
    chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
      const storageKey = ENCODING_PREFIX + tabId;
      chrome.storage.local.remove(storageKey);
    });
    
    // 标签页有切换时
    chrome.tabs.onActivated.addListener((activeInfo) => {
      if (Object.keys(menuMap).length) {
        updateMenu(activeInfo.tabId);
      }
    });

    // 监听页面加载完成事件
    chrome.webNavigation.onCompleted.addListener(async (details) => {
      // 只处理主框架
      if (details.frameId !== 0) return;

      const storageKey = ENCODING_PREFIX + details.tabId;
      const result = await chrome.storage.local.get(storageKey);
      const charset = result[storageKey];

      if (charset) {
        // 通过content script修改字符集
        chrome.tabs.sendMessage(details.tabId, {
          action: "switchCharset",
          charset
        });
      }
    });

    // 当编码设置改变时
    chrome.storage.onChanged.addListener(async (changes, areaName) => {
      if (areaName === 'local') {
        for (const [key, change] of Object.entries(changes)) {
          if (key.startsWith(ENCODING_PREFIX)) {
            const tabId = Number.parseInt(key.replace(ENCODING_PREFIX, ''), 10);
            const charset = change.newValue;
            
            if (charset) {
              // 通过content script修改字符集
              chrome.tabs.sendMessage(tabId, {
                action: "switchCharset",
                charset
              });
            }
          }
        }
      }
    });

    callback?.();
  };

  // 添加菜单点击事件监听器
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "page-charset-check") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.charset,
      }).then((results) => {
        const result = results[0].result;
        chrome.tabs.sendMessage(tab.id, {
          action: "showAlert",
          message: `当前网页字符集是：${result}`
        });
      });
    } else if (info.menuItemId.startsWith("page-charset-")) {
      const charset = info.menuItemId.replace("page-charset-", "");
      const item = resetEncoding.concat(SystemCharsetList).find(([code]) => code === charset);
      
      if (!info.wasChecked || charset === resetEncoding[0][0]) {
        const storageKey = ENCODING_PREFIX + tab.id;
        if (charset === resetEncoding[0][0]) {
          chrome.storage.local.remove(storageKey);
        } else {
          chrome.storage.local.set({ [storageKey]: charset });
        }
        if (!listenerAddedFlag) {
          addOnlineSiteEncodingListener(() => {
            chrome.tabs.reload(tab.id, {
              bypassCache: true,
            });
          });
        } else {
          chrome.tabs.reload(tab.id, {
            bypassCache: true,
          });
        }
      }
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, callback) => {
    // 如果发生了错误，就啥都别干了
    if (chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError);
      return true;
    }

    if (request.type === "page-charset-update-menu") {
      if (!contextMenuId) return;
      chrome.contextMenus.removeAll(() => {
        menuMap = {};
        createMenu();
      });
    }

    callback?.();
    return true;
  });

  return {
    createMenu,
  };
})();

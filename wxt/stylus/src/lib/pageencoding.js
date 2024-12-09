import { TEXT_CODING_MAP } from "./charsets.js";
import * as mv3 from "./mv3_util.js";

export const PageEncoding = (() => {
  // 初始化
  const init = async () => {
    function allocateRuleId(oldRules) {
      function id_occupied(id) {
        for (const rule of oldRules) {
          if (rule.id === id) {
            return true;
          }
        }
        return false;
      }

      //for historical reason, oldRule IDs can be sparsely large, so we search empty slots instead of increment on old ID
      for (let i = 1; i < 32768; i++) {
        if (!id_occupied(i)) {
          //console.log(`allocate new rule id = ${i}`)
          return i;
        }
      }

      return 1; //not likely to happen
    }

    async function getLiveCodeMap() {
      const live_map = { ...TEXT_CODING_MAP };

      const items = await chrome.storage.sync.get({
        disabled_menu: "[]",
        usr_menu: "[]",
      });

      const disabled_menu = JSON.parse(items.disabled_menu);
      const usr_menu = JSON.parse(items.usr_menu);

      for (const code of disabled_menu) {
        delete live_map[code];
      }

      //default menu may be overwritten by user menu if code is the same
      for (const { lang, code } of usr_menu) {
        live_map[code] = [lang, code, true]; //3rd item as flag of user defined
      }

      return live_map;
    }

    //extract site url pattern from page url
    //this pattern serves as url filter for dynamic rules
    function extract_site_url_pattern(url) {
      if (typeof url !== "string") {
        return "Newtab";
      }

      const fragments = url.split("/").slice(0, 3);
      return `${fragments.join("/")}/*`;
    }

    function injectTxt(txt) {
      function _escapeHTML(html) {
        return html
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;")
          .replaceAll("'", "&#039;");
      }

      const url = location.href;
      const is_html = !!url.match(/\.html?$/i);
      const mime_marker = is_html ? "html" : "plain";

      const doc_contents = is_html ? txt : `<pre>${_escapeHTML(txt)}</pre>`;

      const newDoc = document.open(`text/${mime_marker}`, "replace");
      newDoc.write(doc_contents);
      newDoc.close();
    }

    // 检测页面编码
    function detectCharset(tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // 获取 <meta charset> 或 <meta http-equiv="Content-Type">
          const metaCharset = document.querySelector("meta[charset]");
          const metaContentType = document.querySelector(
            "meta[http-equiv='Content-Type']"
          );
          let charset = "unknown";

          if (metaCharset) {
            charset = metaCharset.getAttribute("charset");
          } else if (metaContentType) {
            const content = metaContentType.getAttribute("content");
            const match = content.match(/charset=([^;]+)/i);
            if (match) charset = match[1];
          }

          // 返回结果
          charset = charset || "Default (likely UTF-8 or ISO-8859-1)";
          alert(`Current page charset: ${charset}`);
        },
      });
    }

    //load local file with specified character set
    async function loadLocalFile(url, new_code, tabId) {
      //XMLHttpRequest() not allowed from file:// scheme
      let response = null;
      try {
        response = await fetch(url);
      } catch (e) {
        chrome.tabs.create({ url: chrome.i18n.getMessage("msgPage") });
        return;
      }

      const buf = await response.arrayBuffer();

      const decoder = new TextDecoder(new_code);
      const txt = decoder.decode(buf);

      chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: injectTxt,
        args: [txt],
      });
    }

    // The onClicked callback function.
    async function onClickHandler(info, tab) {
      const new_code = info.menuItemId;
      console.log(new_code);
      if (new_code === "detect_encoding") {
        // alert document.charset
        detectCharset(tab);
        return;
      }

      let flg_need_reload = false;
      let flg_add_rule = true;

      const url_pattern = extract_site_url_pattern(tab.url);

      const oldRules = await chrome.declarativeNetRequest.getDynamicRules();

      const id_to_remove = mv3.findRuleIdByUrl(oldRules, url_pattern);

      if (new_code === "default") {
        flg_need_reload = true;
        flg_add_rule = false;
      } else {
        if (url_pattern === "file:///*") {
          await loadLocalFile(tab.url, new_code, tab.id);
        } else {
          flg_need_reload = true;
        }
      }

      if (flg_need_reload) {
        //if (flg_add_rule && id_to_remove){
        //    console.log(`reuse rule id = ${id_to_remove}`)
        //}
        //reuse old rule ID to avoid adding duplicated rules for the same site
        const new_id = id_to_remove || allocateRuleId(oldRules);
        chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: id_to_remove ? [id_to_remove] : [],
          addRules: flg_add_rule
            ? [mv3.composeRule(new_id, url_pattern, new_code)]
            : [],
        });

        chrome.tabs.update(tab.id, { url: tab.url });
      }
    }

    chrome.contextMenus.onClicked.addListener(onClickHandler);

    //update selected coding every time new page loaded
    //this action may be expensive
    chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
      if (changeInfo.status === "complete") {
        //update context menu
        const g_site2Code = await mv3.get_site2Code();
        const url_pattern = extract_site_url_pattern(tab.url);
        const my_code = g_site2Code[url_pattern] || "default";

        const live_code_map = await getLiveCodeMap();

        if (live_code_map[my_code]) {
          chrome.contextMenus.update(
            my_code,
            {
              checked: true,
            },
            () => {
              const err = chrome.runtime.lastError;
              if (
                err &&
                err.message.indexOf("Cannot find menu item with id") >= 0
              ) {
                //for some reason, menu may not be present
                updateContextMenu().then(() => {
                  chrome.contextMenus.update(my_code, {
                    checked: true,
                  });
                });
              }
            }
          );
        } else {
          //console.warn(`${my_code} not found in menu`)
          const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
          const ruleId = await mv3.findRuleIdByUrl(oldRules, url_pattern);
          if (ruleId) {
            //console.log(`remove code ${my_code} for site ${url_pattern}`)
            await chrome.declarativeNetRequest.updateDynamicRules({
              removeRuleIds: [ruleId],
            });
          }
        }
      }
    });

    async function updateContextMenu() {
      const live_code_map = await getLiveCodeMap();
      chrome.contextMenus.removeAll();

      chrome.contextMenus.create({
        title: chrome.i18n.getMessage("page_encoding"),
        type: "normal",
        contexts: ["page"],
        id: "parent_menu",
      });

      chrome.contextMenus.create({
        title: "检测编码",
        type: "normal",
        contexts: ["page"],
        id: "detect_encoding",
        parentId: "parent_menu",
      });

      chrome.contextMenus.create({
        type: "separator",
        contexts: ["page"],
        id: "separator",
        parentId: "parent_menu",
      });

      for (let [code, [language, ui_code, is_custom]] of Object.entries(
        live_code_map
      )) {
        if (!is_custom) {
          language = chrome.i18n.getMessage(language);
        }

        let menu_title = language;

        if (ui_code) {
          menu_title += ` (${ui_code})`;
        }

        chrome.contextMenus.create({
          title: menu_title,
          type: "radio",
          contexts: ["page"],
          id: code,
          parentId: "parent_menu",
        });
      }

      console.log("Context menu updated");
    }

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "sync") {
        updateContextMenu().then(() => {});
      }
    });

    // Set up context menu at install time.
    chrome.runtime.onInstalled.addListener(updateContextMenu);
  };

  return { init };
})();

import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  manifest: {
    name: "Stylus",
    description: "CSS样式字体颜色自定义,护眼模式,高级选择复制,页面编码设置,js设置",
    default_locale: "zh_CN",
    permissions: [
      "activeTab",
      "storage",
      "scripting",
      "contextMenus",
      "webNavigation",
      "webRequest",
      "webRequestBlocking",
      "tabs",
      "declarativeNetRequest",
      "declarativeNetRequestWithHostAccess",
    ],
    host_permissions: ["<all_urls>"],
    web_accessible_resources: [
      {
        resources: ["vconsole.bundle.js"],
        matches: ["<all_urls>"],
      },
    ],
    icons: {
      16: "icon/icon16.png",
      48: "icon/icon48.png",
      128: "icon/icon128.png",
    },
  },
  modules: ["@wxt-dev/module-react"],
});

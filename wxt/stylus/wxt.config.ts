import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Stylus',
    description: '自定义网站CSS样式的浏览器扩展',
    permissions: ['activeTab', 'storage'],
    host_permissions: ['<all_urls>']
  },
  modules: ['@wxt-dev/module-react'],
});

import { defineConfig } from 'wxt';

export default defineConfig({
  extensionApi: 'chrome',
  manifest: {
    name: 'Stylus',
    description: '自定义网站CSS样式的浏览器扩展',
    permissions: [
      'activeTab', 
      'storage',
      'scripting',
      'webNavigation'
    ],
    host_permissions: ['<all_urls>'],
    web_accessible_resources: [{
      resources: ['vconsole.bundle.js'],
      matches: ['<all_urls>']
    }]
  },
  modules: ['@wxt-dev/module-react'],
});

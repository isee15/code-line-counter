interface ResourceRule {
  id: string;
  enabled: boolean;
  url: string;
  contentType: string;
  type: 'block' | 'modify' | 'inject';
  content?: string;
  function?: string;
}

// 日志工具函数
const log = (...args: unknown[]) => {
  console.log('[Background]', ...args);
};

const error = (...args: unknown[]) => {
  console.error('[Background]', ...args);
};

const DEFAULT_RULES: ResourceRule[] = [
  {
    id: 'vconsole',
    enabled: false,
    url: '.*',
    contentType: 'text/html',
    type: 'inject'
  }
];

export default defineBackground(() => {
  log('初始化...');
  // 存储用户定义的规则
  let rules: ResourceRule[] = [];

  // 初始化规则
  const initRules = async () => {
    log('开始加载规则');
    const result = await chrome.storage.local.get('resource-rules');
    const savedRules = result['resource-rules'] || [];
    // 确保默认规则存在
    const mergedRules = [...DEFAULT_RULES];
    
    for (const rule of savedRules) {
      if (!DEFAULT_RULES.find(defaultRule => defaultRule.id === rule.id)) {
        mergedRules.push(rule);
      }
    }

    rules = mergedRules;
    await chrome.storage.local.set({ 'resource-rules': rules });
    log('规则加载完成:', rules);
  };

  // 初始化
  initRules();

  // 监听规则更新
  chrome.storage.onChanged.addListener((changes) => {
    if (changes['resource-rules']) {
      rules = changes['resource-rules'].newValue || [];
      log('规则已更新:', rules);
    }
  });

  // 注入脚本的函数
  const injectScript = async (tabId: number, rule: ResourceRule) => {
    if (rule.type !== 'inject') return;

    try {
      log(`开始注入脚本 ${rule.id} 到标签页 ${tabId}`);
      if (rule.id === 'vconsole') {
        // 注入vConsole bundle
        log('注入vConsole bundle');
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['vconsole.bundle.js'],
          world: 'MAIN'  // 在主页面的上下文中执行
        });
        log('vConsole bundle注入完成');
      } else if (rule.function) {
        // 对于其他注入规则，直接注入代码
        log('注入自定义函数');
        await chrome.scripting.executeScript({
          target: { tabId },
          func: (functionContent: string) => {
            const scriptElement = document.createElement('script');
            // 使用更可靠的方式包装和执行代码
            scriptElement.textContent = `
              try {
                (${functionContent})();
              } catch (e) {
                console.error('Injection script error:', e);
              }
            `;
            (document.head || document.documentElement).appendChild(scriptElement);
            scriptElement.remove();
          },
          args: [rule.function],
          world: 'MAIN'
        });
        log('自定义函数注入完成');
      }
    } catch (err) {
      error('注入脚本失败:', err, rule);
    }
  };

  // 监听页面加载完成事件
  chrome.webNavigation.onCompleted.addListener(async (details) => {
    // 只处理主框架
    if (details.frameId !== 0) return;

    log(`页面加载完成: ${details.url}`);
    const htmlRules = rules.filter(rule => 
      rule.enabled && 
      rule.contentType === 'text/html' &&
      details.url.match(new RegExp(rule.url))
    );

    log('匹配的HTML规则:', htmlRules);
    for (const rule of htmlRules) {
      await injectScript(details.tabId, rule);
    }
  });

  // 处理来自popup的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    log('收到消息:', message);
    if (message.type === 'UPDATE_RULES') {
      chrome.storage.local.get('resource-rules').then((result) => {
        rules = result['resource-rules'] || [];
        log('规则已更新:', rules);
      });
    }
  });
});

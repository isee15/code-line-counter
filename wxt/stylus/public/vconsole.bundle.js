(() => {
  const log = (...args) => {
    // 同时在页面和扩展的console中显示日志
    console.log('[vConsole]', ...args);
    window.console.log('[vConsole]', ...args);
  };

  const error = (...args) => {
    console.error('[vConsole]', ...args);
    window.console.error('[vConsole]', ...args);
  };

  log('开始注入...');
  const script = document.createElement('script');
  script.src = 'https://unpkg.com/vconsole@latest/dist/vconsole.min.js';
  
  script.onload = () => {
    log('脚本加载完成');
    // 确保只初始化一次
    if (!window._vConsoleInjected) {
      log('开始初始化');
      window._vConsoleInjected = true;
      
      // 直接执行初始化代码，而不是通过新的script标签
      try {
        log('创建实例');
        window.vConsole = new window.VConsole();
        log('初始化成功');
      } catch (err) {
        error('初始化失败:', err);
      }
    } else {
      log('已经初始化过，跳过');
    }
  };

  script.onerror = (err) => {
    error('脚本加载失败:', err);
  };

  log('添加脚本到页面');
  document.head.appendChild(script);
})(); 
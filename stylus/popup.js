document.addEventListener('DOMContentLoaded', () => {
    const userLang = navigator.language || navigator.userLanguage; // 获取用户语言
    const lang = userLang.startsWith('zh') ? 'zh' : 'en'; // 判断语言

    if (lang === 'zh') {
        document.querySelector('h1').textContent = '欢迎使用自定义样式扩展';
        document.querySelector('#openOptions').textContent = '设置样式';
    } else {
        document.querySelector('h1').textContent = 'Welcome to Custom Style Extension';
        document.querySelector('#openOptions').textContent = 'Set Styles';
    }

    document.getElementById('openOptions').addEventListener('click', () => {
        chrome.runtime.openOptionsPage(); // 打开选项页面
    });
}); 
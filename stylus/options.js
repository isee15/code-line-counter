document.addEventListener('DOMContentLoaded', () => {
    const userLang = navigator.language || navigator.userLanguage; // 获取用户语言
    const lang = userLang.startsWith('zh') ? 'zh' : 'en'; // 判断语言

    if (lang === 'zh') {
        document.querySelector('h1').textContent = '自定义样式设置';
        document.querySelector('label[for="styleInput"]').textContent = '输入自定义样式:';
        document.querySelector('#saveButton').textContent = '保存样式';
        document.querySelector('.note').textContent = '请使用有效的CSS样式。';
    } else {
        document.querySelector('h1').textContent = 'Custom Style Settings';
        document.querySelector('label[for="styleInput"]').textContent = 'Enter Custom Styles:';
        document.querySelector('#saveButton').textContent = 'Save Styles';
        document.querySelector('.note').textContent = 'Please use valid CSS styles.';
    }

    document.getElementById('saveButton').addEventListener('click', () => {
        const style = document.getElementById('styleInput').value;
        chrome.storage.sync.set({ customStyle: style }, () => {
            alert('样式已保存！');
        });
    });

    // 加载已保存的样式
    chrome.storage.sync.get('customStyle', (data) => {
        document.getElementById('styleInput').value = data.customStyle || '';
    });
}); 
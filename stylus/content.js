chrome.storage.sync.get('customStyle', (data) => {
    if (data.customStyle) {
        const style = document.createElement('style');
        style.textContent = data.customStyle;
        document.head.appendChild(style);
    }
}); 
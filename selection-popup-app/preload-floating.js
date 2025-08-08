const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给悬浮窗口
contextBridge.exposeInMainWorld('electronAPI', {
    // 获取按钮配置
    getButtons: () => ipcRenderer.invoke('get-buttons'),
    
    // 执行AI操作
    performAIAction: (data) => ipcRenderer.invoke('perform-ai-action', data),
    
    // 接收显示文本的事件
    onShowText: (callback) => {
        ipcRenderer.on('show-text', (event, text) => {
            callback(text);
        });
    }
});
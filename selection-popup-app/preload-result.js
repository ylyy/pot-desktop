const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给结果窗口
contextBridge.exposeInMainWorld('electronAPI', {
    // 接收显示结果的事件
    onShowResult: (callback) => {
        ipcRenderer.on('show-result', (event, data) => {
            callback(data);
        });
    }
});
const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    performAIAction: (data) => ipcRenderer.invoke('perform-ai-action', data)
});
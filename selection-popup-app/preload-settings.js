const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给设置页面
contextBridge.exposeInMainWorld('electronAPI', {
    // 配置管理
    getConfig: () => ipcRenderer.invoke('get-config'),
    setConfig: (key, value) => ipcRenderer.invoke('set-config', key, value),
    
    // 按钮管理
    getButtons: () => ipcRenderer.invoke('get-buttons'),
    addButton: (button) => ipcRenderer.invoke('add-button', button),
    updateButton: (id, updates) => ipcRenderer.invoke('update-button', id, updates),
    deleteButton: (id) => ipcRenderer.invoke('delete-button', id),
    
    // API测试
    testAPI: () => ipcRenderer.invoke('test-api'),
    
    // 打开外部链接
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
});
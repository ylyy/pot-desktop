const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    // 开发时打开开发者工具
    // mainWindow.webContents.openDevTools();
}

// 处理AI功能请求
ipcMain.handle('perform-ai-action', async (event, { action, text }) => {
    console.log(`收到AI请求: ${action}`);
    console.log(`文本内容: ${text}`);

    // 这里可以调用实际的AI API
    // 例如: OpenAI API, 百度API, 讯飞API等
    
    // 模拟AI处理结果
    let result = '';
    
    switch (action) {
        case 'translate':
            result = `翻译结果: ${text} -> [翻译后的内容]`;
            break;
        case 'explain':
            result = `解释: ${text} 的含义是...`;
            break;
        case 'summarize':
            result = `总结: 这段文本主要讲述了...`;
            break;
        case 'rewrite':
            result = `改写: [改写后的文本]`;
            break;
        case 'grammar':
            result = `语法检查: 文本语法正确 ✓`;
            break;
        default:
            result = '未知的AI功能';
    }

    // 返回处理结果
    return {
        success: true,
        result: result,
        originalText: text,
        action: action
    };
});

// 禁用默认菜单（可选）
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
const { 
    app, 
    BrowserWindow, 
    ipcMain, 
    Menu, 
    Tray, 
    globalShortcut,
    clipboard,
    screen,
    shell,
    nativeImage
} = require('electron');
const path = require('path');
const robot = require('robotjs'); // 需要安装用于模拟键盘操作

let mainWindow;
let tray;
let floatingWindow; // 悬浮窗口用于显示AI按钮
let lastClipboard = '';
let clipboardWatcher;

// 创建悬浮窗口
function createFloatingWindow() {
    floatingWindow = new BrowserWindow({
        width: 380,
        height: 80,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        resizable: false,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload-floating.js')
        }
    });

    floatingWindow.loadFile('floating.html');
    
    // 防止窗口被关闭，只是隐藏
    floatingWindow.on('close', (e) => {
        e.preventDefault();
        floatingWindow.hide();
    });

    // 鼠标离开窗口时自动隐藏
    floatingWindow.on('blur', () => {
        setTimeout(() => {
            if (floatingWindow && !floatingWindow.isDestroyed()) {
                floatingWindow.hide();
            }
        }, 200);
    });
}

// 创建主窗口（设置页面）
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('settings.html');

    mainWindow.on('close', (e) => {
        e.preventDefault();
        mainWindow.hide();
    });
}

// 创建系统托盘
function createTray() {
    // 创建托盘图标
    const iconPath = path.join(__dirname, 'assets', 'tray-icon.png');
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '显示设置',
            click: () => {
                mainWindow.show();
            }
        },
        {
            label: '开启/关闭划词',
            type: 'checkbox',
            checked: true,
            click: (menuItem) => {
                if (menuItem.checked) {
                    startClipboardWatcher();
                } else {
                    stopClipboardWatcher();
                }
            }
        },
        { type: 'separator' },
        {
            label: '使用说明',
            click: () => {
                shell.openExternal('https://github.com/your-repo/ai-selection-helper');
            }
        },
        {
            label: '退出',
            click: () => {
                app.isQuiting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('AI划词助手 - 运行中');
    tray.setContextMenu(contextMenu);

    // 点击托盘图标显示/隐藏主窗口
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    });
}

// 开始监听剪贴板
function startClipboardWatcher() {
    // 方法1：定时检查剪贴板
    clipboardWatcher = setInterval(() => {
        const currentClipboard = clipboard.readText();
        
        if (currentClipboard && currentClipboard !== lastClipboard && currentClipboard.trim().length > 0) {
            lastClipboard = currentClipboard;
            
            // 获取鼠标位置
            const mousePos = screen.getCursorScreenPoint();
            showFloatingWindow(mousePos, currentClipboard);
        }
    }, 300);

    // 方法2：注册全局快捷键触发
    registerGlobalShortcuts();
}

// 停止监听剪贴板
function stopClipboardWatcher() {
    if (clipboardWatcher) {
        clearInterval(clipboardWatcher);
        clipboardWatcher = null;
    }
    unregisterGlobalShortcuts();
}

// 显示悬浮窗口
function showFloatingWindow(position, text) {
    if (!floatingWindow || text.length > 1000) return; // 文本太长不显示

    // 计算窗口位置
    const display = screen.getDisplayNearestPoint(position);
    const { width, height } = display.workAreaSize;
    const windowBounds = floatingWindow.getBounds();

    let x = position.x - windowBounds.width / 2;
    let y = position.y + 20;

    // 确保窗口不超出屏幕
    if (x < display.bounds.x) x = display.bounds.x;
    if (x + windowBounds.width > display.bounds.x + width) {
        x = display.bounds.x + width - windowBounds.width;
    }
    if (y + windowBounds.height > display.bounds.y + height) {
        y = position.y - windowBounds.height - 20;
    }

    floatingWindow.setPosition(Math.round(x), Math.round(y));
    floatingWindow.webContents.send('show-text', text);
    floatingWindow.showInactive(); // 显示但不获取焦点
}

// 注册全局快捷键
function registerGlobalShortcuts() {
    // 主快捷键：选中文本后按 Ctrl+Q 触发
    globalShortcut.register('CommandOrControl+Q', () => {
        // 保存当前剪贴板内容
        const oldClipboard = clipboard.readText();
        
        // 模拟 Ctrl+C 复制选中的文本
        if (process.platform === 'darwin') {
            robot.keyTap('c', 'command');
        } else {
            robot.keyTap('c', 'control');
        }

        // 等待复制完成
        setTimeout(() => {
            const selectedText = clipboard.readText();
            
            if (selectedText && selectedText !== oldClipboard) {
                const mousePos = screen.getCursorScreenPoint();
                showFloatingWindow(mousePos, selectedText);
                
                // 恢复原剪贴板内容
                setTimeout(() => {
                    clipboard.writeText(oldClipboard);
                }, 100);
            }
        }, 50);
    });

    // 双击 Ctrl 键触发
    let ctrlPressTime = 0;
    globalShortcut.register('CommandOrControl', () => {
        const now = Date.now();
        if (now - ctrlPressTime < 300) {
            // 双击 Ctrl
            triggerSelection();
        }
        ctrlPressTime = now;
    });
}

// 触发选中文本的处理
function triggerSelection() {
    const oldClipboard = clipboard.readText();
    
    // 模拟复制
    if (process.platform === 'darwin') {
        robot.keyTap('c', 'command');
    } else {
        robot.keyTap('c', 'control');
    }

    setTimeout(() => {
        const selectedText = clipboard.readText();
        if (selectedText && selectedText !== oldClipboard) {
            const mousePos = screen.getCursorScreenPoint();
            showFloatingWindow(mousePos, selectedText);
            
            // 恢复剪贴板
            setTimeout(() => {
                clipboard.writeText(oldClipboard);
            }, 100);
        }
    }, 50);
}

// 取消注册快捷键
function unregisterGlobalShortcuts() {
    globalShortcut.unregisterAll();
}

// 处理AI功能请求
ipcMain.handle('perform-ai-action', async (event, { action, text }) => {
    console.log(`AI请求: ${action} - 文本长度: ${text.length}`);
    
    // 隐藏悬浮窗口
    if (floatingWindow) {
        floatingWindow.hide();
    }

    // 显示结果窗口
    showResultWindow(action, text);

    // 这里调用实际的AI API
    return {
        success: true,
        result: `${action} 结果：\n${text}\n\n[这里是AI处理后的结果]`,
        originalText: text,
        action: action
    };
});

// 显示结果窗口
function showResultWindow(action, text) {
    const resultWindow = new BrowserWindow({
        width: 500,
        height: 600,
        frame: true,
        alwaysOnTop: true,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload-result.js')
        }
    });

    resultWindow.loadFile('result.html');
    
    resultWindow.webContents.on('did-finish-load', () => {
        resultWindow.webContents.send('show-result', { action, text });
    });
}

// 应用准备就绪
app.whenReady().then(() => {
    createMainWindow();
    createFloatingWindow();
    createTray();
    startClipboardWatcher();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

// 应用退出前清理
app.on('will-quit', () => {
    globalShortcut.unregisterAll();
    if (clipboardWatcher) {
        clearInterval(clipboardWatcher);
    }
});

app.on('window-all-closed', () => {
    // 不退出应用，保持在系统托盘
});

// 防止多开
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
}
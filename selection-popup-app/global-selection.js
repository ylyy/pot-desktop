// 全局选择监听器 - 用于在任何应用中检测文本选择
const { clipboard, globalShortcut } = require('electron');

class GlobalSelectionListener {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
        this.lastSelection = '';
        this.pollingInterval = null;
    }

    // 开始监听选择
    start() {
        // 方法1: 使用轮询检查剪贴板（适用于自动复制选中文本的场景）
        // 注意：这种方法需要用户设置或应用自动复制选中的文本
        this.startClipboardPolling();

        // 方法2: 注册全局快捷键来触发
        this.registerGlobalShortcut();
    }

    // 停止监听
    stop() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        globalShortcut.unregisterAll();
    }

    // 剪贴板轮询方法
    startClipboardPolling() {
        // 每500ms检查一次剪贴板
        this.pollingInterval = setInterval(() => {
            try {
                const currentText = clipboard.readText();
                
                // 如果剪贴板内容变化且不为空
                if (currentText && currentText !== this.lastSelection) {
                    this.lastSelection = currentText;
                    
                    // 发送到渲染进程
                    this.mainWindow.webContents.send('text-selected', {
                        text: currentText,
                        method: 'clipboard'
                    });
                }
            } catch (error) {
                console.error('剪贴板读取错误:', error);
            }
        }, 500);
    }

    // 全局快捷键方法
    registerGlobalShortcut() {
        // 注册 Ctrl+Shift+A (Windows/Linux) 或 Cmd+Shift+A (macOS)
        const accelerator = process.platform === 'darwin' ? 'Cmd+Shift+A' : 'Ctrl+Shift+A';
        
        globalShortcut.register(accelerator, () => {
            // 模拟复制操作获取选中文本
            const currentClipboard = clipboard.readText();
            
            // 发送复制命令
            this.mainWindow.webContents.send('trigger-copy');
            
            // 等待一下让复制完成
            setTimeout(() => {
                const selectedText = clipboard.readText();
                
                if (selectedText && selectedText !== currentClipboard) {
                    // 发送选中的文本
                    this.mainWindow.webContents.send('text-selected', {
                        text: selectedText,
                        method: 'shortcut'
                    });
                    
                    // 恢复原来的剪贴板内容
                    clipboard.writeText(currentClipboard);
                }
            }, 100);
        });
    }
}

module.exports = GlobalSelectionListener;
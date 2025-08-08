const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class ConfigStore {
    constructor() {
        const userDataPath = app.getPath('userData');
        this.path = path.join(userDataPath, 'config.json');
        this.data = this.loadConfig();
    }

    // 加载配置
    loadConfig() {
        try {
            if (fs.existsSync(this.path)) {
                return JSON.parse(fs.readFileSync(this.path));
            }
        } catch (error) {
            console.error('加载配置失败:', error);
        }
        
        // 返回默认配置
        return this.getDefaultConfig();
    }

    // 获取默认配置
    getDefaultConfig() {
        return {
            // AI按钮配置
            buttons: [
                {
                    id: 'translate',
                    name: '翻译',
                    icon: '🌐',
                    enabled: true,
                    prompt: '请将以下文本翻译成中文（如果是中文则翻译成英文）：\n\n{text}'
                },
                {
                    id: 'explain',
                    name: '解释',
                    icon: '💡',
                    enabled: true,
                    prompt: '请详细解释以下内容的含义：\n\n{text}'
                },
                {
                    id: 'summarize',
                    name: '总结',
                    icon: '📝',
                    enabled: true,
                    prompt: '请简要总结以下内容的要点：\n\n{text}'
                },
                {
                    id: 'rewrite',
                    name: '改写',
                    icon: '✏️',
                    enabled: true,
                    prompt: '请用更优雅的方式改写以下内容：\n\n{text}'
                },
                {
                    id: 'grammar',
                    name: '纠错',
                    icon: '✔️',
                    enabled: true,
                    prompt: '请检查并修正以下文本的语法错误：\n\n{text}'
                }
            ],
            
            // API配置
            api: {
                provider: 'openai', // openai, azure, custom
                openai: {
                    apiKey: '',
                    apiUrl: 'https://api.openai.com/v1',
                    model: 'gpt-3.5-turbo',
                    temperature: 0.7,
                    maxTokens: 2000
                },
                azure: {
                    apiKey: '',
                    endpoint: '',
                    deploymentName: '',
                    apiVersion: '2023-05-15'
                },
                custom: {
                    url: '',
                    headers: {},
                    method: 'POST',
                    bodyTemplate: '{}'
                }
            },
            
            // 通用设置
            general: {
                autoStart: true,
                shortcut: 'CommandOrControl+Q',
                theme: 'light',
                language: 'zh-CN',
                maxTextLength: 5000,
                showTrayIcon: true,
                enableClipboardWatch: false,
                clipboardWatchInterval: 500
            },
            
            // 窗口设置
            window: {
                opacity: 0.95,
                alwaysOnTop: true,
                autoHide: true,
                autoHideDelay: 200
            }
        };
    }

    // 保存配置
    save() {
        try {
            fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
            return true;
        } catch (error) {
            console.error('保存配置失败:', error);
            return false;
        }
    }

    // 获取配置项
    get(key) {
        const keys = key.split('.');
        let result = this.data;
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return undefined;
            }
        }
        
        return result;
    }

    // 设置配置项
    set(key, value) {
        const keys = key.split('.');
        let obj = this.data;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in obj) || typeof obj[k] !== 'object') {
                obj[k] = {};
            }
            obj = obj[k];
        }
        
        obj[keys[keys.length - 1]] = value;
        return this.save();
    }

    // 获取所有按钮
    getButtons() {
        return this.data.buttons || [];
    }

    // 添加自定义按钮
    addButton(button) {
        if (!this.data.buttons) {
            this.data.buttons = [];
        }
        
        // 生成唯一ID
        button.id = `custom_${Date.now()}`;
        this.data.buttons.push(button);
        
        return this.save() ? button : null;
    }

    // 更新按钮
    updateButton(id, updates) {
        const index = this.data.buttons.findIndex(b => b.id === id);
        if (index !== -1) {
            this.data.buttons[index] = { ...this.data.buttons[index], ...updates };
            return this.save();
        }
        return false;
    }

    // 删除按钮
    deleteButton(id) {
        // 不允许删除默认按钮
        const defaultIds = ['translate', 'explain', 'summarize', 'rewrite', 'grammar'];
        if (defaultIds.includes(id)) {
            return false;
        }
        
        this.data.buttons = this.data.buttons.filter(b => b.id !== id);
        return this.save();
    }

    // 重置为默认配置
    reset() {
        this.data = this.getDefaultConfig();
        return this.save();
    }
}

module.exports = ConfigStore;
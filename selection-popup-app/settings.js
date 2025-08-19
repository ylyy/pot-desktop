// 设置页面的JavaScript逻辑

let currentEditButton = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadButtons();
    loadAPISettings();
    loadGeneralSettings();
    initAPITabs();
});

// 初始化导航
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            showSection(section);
            
            // 更新导航状态
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// 显示指定部分
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// 加载按钮列表
async function loadButtons() {
    const buttons = await window.electronAPI.getButtons();
    const buttonList = document.getElementById('buttonList');
    
    buttonList.innerHTML = '';
    
    buttons.forEach(button => {
        const buttonItem = createButtonItem(button);
        buttonList.appendChild(buttonItem);
    });
}

// 创建按钮项
function createButtonItem(button) {
    const div = document.createElement('div');
    div.className = 'button-item';
    div.innerHTML = `
        <div class="button-icon">${button.icon || '🔧'}</div>
        <div class="button-info">
            <div class="button-name">${button.name}</div>
            <div class="button-prompt">${button.prompt.substring(0, 50)}...</div>
        </div>
        <div class="button-actions">
            <label class="switch">
                <input type="checkbox" ${button.enabled ? 'checked' : ''} 
                       onchange="toggleButton('${button.id}', this.checked)">
                <span class="slider"></span>
            </label>
            <button class="btn btn-secondary" onclick="editButton('${button.id}')">编辑</button>
            ${button.id.startsWith('custom_') ? 
                `<button class="btn btn-danger" onclick="deleteButton('${button.id}')">删除</button>` : 
                ''}
        </div>
    `;
    return div;
}

// 切换按钮启用状态
async function toggleButton(id, enabled) {
    await window.electronAPI.updateButton(id, { enabled });
}

// 显示添加按钮对话框
function showAddButtonDialog() {
    currentEditButton = null;
    document.getElementById('dialogTitle').textContent = '添加新按钮';
    document.getElementById('buttonName').value = '';
    document.getElementById('buttonIcon').value = '';
    document.getElementById('buttonPrompt').value = '';
    document.getElementById('buttonEnabled').checked = true;
    
    document.getElementById('buttonDialog').style.display = 'flex';
}

// 编辑按钮
async function editButton(id) {
    const buttons = await window.electronAPI.getButtons();
    const button = buttons.find(b => b.id === id);
    
    if (button) {
        currentEditButton = button;
        document.getElementById('dialogTitle').textContent = '编辑按钮';
        document.getElementById('buttonName').value = button.name;
        document.getElementById('buttonIcon').value = button.icon || '';
        document.getElementById('buttonPrompt').value = button.prompt;
        document.getElementById('buttonEnabled').checked = button.enabled;
        
        document.getElementById('buttonDialog').style.display = 'flex';
    }
}

// 保存按钮
async function saveButton() {
    const name = document.getElementById('buttonName').value.trim();
    const icon = document.getElementById('buttonIcon').value.trim();
    const prompt = document.getElementById('buttonPrompt').value.trim();
    const enabled = document.getElementById('buttonEnabled').checked;
    
    if (!name || !prompt) {
        alert('请填写按钮名称和提示词');
        return;
    }
    
    const buttonData = { name, icon, prompt, enabled };
    
    if (currentEditButton) {
        // 更新现有按钮
        await window.electronAPI.updateButton(currentEditButton.id, buttonData);
    } else {
        // 添加新按钮
        await window.electronAPI.addButton(buttonData);
    }
    
    closeButtonDialog();
    loadButtons();
}

// 删除按钮
async function deleteButton(id) {
    if (confirm('确定要删除这个按钮吗？')) {
        await window.electronAPI.deleteButton(id);
        loadButtons();
    }
}

// 关闭按钮对话框
function closeButtonDialog() {
    document.getElementById('buttonDialog').style.display = 'none';
}

// 初始化API标签页
function initAPITabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const provider = tab.dataset.provider;
            
            // 更新标签状态
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示对应配置
            document.querySelectorAll('.api-config').forEach(config => {
                config.style.display = 'none';
            });
            const configElement = document.getElementById(`${provider}-config`);
            if (configElement) {
                configElement.style.display = 'block';
            }
        });
    });
}

// 加载API设置
async function loadAPISettings() {
    const config = await window.electronAPI.getConfig();
    const api = config.api;
    
    // OpenAI设置
    document.getElementById('openai-apiKey').value = api.openai.apiKey || '';
    document.getElementById('openai-apiUrl').value = api.openai.apiUrl || 'https://api.openai.com/v1';
    document.getElementById('openai-model').value = api.openai.model || 'gpt-3.5-turbo';
    document.getElementById('openai-temperature').value = api.openai.temperature || 0.7;
    document.getElementById('openai-maxTokens').value = api.openai.maxTokens || 2000;
    
    // Azure设置
    document.getElementById('azure-apiKey').value = api.azure.apiKey || '';
    document.getElementById('azure-endpoint').value = api.azure.endpoint || '';
    document.getElementById('azure-deploymentName').value = api.azure.deploymentName || '';
    
    // 自定义API设置
    document.getElementById('custom-url').value = api.custom.url || '';
    document.getElementById('custom-headers').value = JSON.stringify(api.custom.headers || {}, null, 2);
    document.getElementById('custom-bodyTemplate').value = api.custom.bodyTemplate || '';
    document.getElementById('custom-streaming').checked = api.custom.streaming || false;
    
    // Dify API设置
    if (api.dify) {
        document.getElementById('dify-url').value = api.dify.url || 'http://aifoundry.unisoc.com:8099/v1/chat-messages';
        document.getElementById('dify-apiKey').value = api.dify.apiKey || '';
    }
    
    // 设置当前提供商
    const currentProvider = api.provider || 'openai';
    document.querySelector(`[data-provider="${currentProvider}"]`).click();
}

// 保存API设置
async function saveAPISettings() {
    const apiConfig = {
        provider: document.querySelector('.tab.active').dataset.provider,
        openai: {
            apiKey: document.getElementById('openai-apiKey').value,
            apiUrl: document.getElementById('openai-apiUrl').value,
            model: document.getElementById('openai-model').value,
            temperature: parseFloat(document.getElementById('openai-temperature').value),
            maxTokens: parseInt(document.getElementById('openai-maxTokens').value)
        },
        azure: {
            apiKey: document.getElementById('azure-apiKey').value,
            endpoint: document.getElementById('azure-endpoint').value,
            deploymentName: document.getElementById('azure-deploymentName').value
        },
        custom: {
            url: document.getElementById('custom-url').value,
            headers: JSON.parse(document.getElementById('custom-headers').value || '{}'),
            bodyTemplate: document.getElementById('custom-bodyTemplate').value,
            streaming: document.getElementById('custom-streaming').checked
        },
        dify: {
            url: document.getElementById('dify-url').value,
            apiKey: document.getElementById('dify-apiKey').value,
            streaming: true
        }
    };
    
    await window.electronAPI.setConfig('api', apiConfig);
    alert('API设置已保存');
}

// 测试API连接
async function testAPI() {
    const result = await window.electronAPI.testAPI();
    if (result.success) {
        alert('API连接成功！');
    } else {
        alert(`API连接失败：${result.error}`);
    }
}

// 加载通用设置
async function loadGeneralSettings() {
    const config = await window.electronAPI.getConfig();
    const general = config.general;
    
    document.getElementById('autoStart').checked = general.autoStart;
    document.getElementById('shortcut').value = general.shortcut;
    document.getElementById('theme').value = general.theme;
    document.getElementById('maxTextLength').value = general.maxTextLength;
    document.getElementById('enableClipboardWatch').checked = general.enableClipboardWatch;
    document.getElementById('triggerMode').value = general.triggerMode || 'shortcut';
    
    // 更新UI显示
    updateTriggerModeUI();
}

// 保存通用设置
async function saveGeneralSettings() {
    const generalConfig = {
        autoStart: document.getElementById('autoStart').checked,
        shortcut: document.getElementById('shortcut').value,
        theme: document.getElementById('theme').value,
        maxTextLength: parseInt(document.getElementById('maxTextLength').value),
        enableClipboardWatch: document.getElementById('enableClipboardWatch').checked,
        triggerMode: document.getElementById('triggerMode').value
    };
    
    await window.electronAPI.setConfig('general', generalConfig);
    alert('通用设置已保存，需要重启应用生效');
}

// 更新触发方式UI
function updateTriggerModeUI() {
    const triggerMode = document.getElementById('triggerMode').value;
    
    // 显示/隐藏快捷键设置
    document.getElementById('shortcutGroup').style.display = 
        triggerMode === 'shortcut' ? 'block' : 'none';
    
    // 显示/隐藏剪贴板监听设置
    document.getElementById('clipboardWatchGroup').style.display = 
        triggerMode === 'clipboard' ? 'block' : 'none';
}

// 快捷键输入
document.getElementById('shortcut')?.addEventListener('keydown', (e) => {
    e.preventDefault();
    
    const keys = [];
    if (e.ctrlKey) keys.push('Ctrl');
    if (e.altKey) keys.push('Alt');
    if (e.shiftKey) keys.push('Shift');
    if (e.metaKey) keys.push('Cmd');
    
    if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        keys.push(e.key.toUpperCase());
    }
    
    if (keys.length > 0) {
        e.target.value = keys.join('+');
    }
});

// 检查更新
function checkUpdate() {
    alert('已是最新版本');
}

// 打开GitHub
function openGithub() {
    window.electronAPI.openExternal('https://github.com/your-repo/ai-selection-helper');
}
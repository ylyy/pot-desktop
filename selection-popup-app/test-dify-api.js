// 测试 Dify API 调用
const https = require('https');
const http = require('http');
const url = require('url');

// 测试配置
const config = {
    url: 'http://aifoundry.unisoc.com:8099/v1/chat-messages',
    apiKey: 'YOUR_API_KEY_HERE' // 请替换为实际的API Key
};

// 测试数据
const testData = {
    text: 'Hello World',
    prompt: '请将以下文本翻译成中文：Hello World'
};

function testDifyAPI() {
    console.log('开始测试 Dify API...');
    
    const headers = {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
    };
    
    const queryText = testData.prompt || testData.text;
    
    const bodyObj = {
        inputs: {},
        query: queryText,
        response_mode: "streaming",
        conversation_id: "",
        user: "user-" + Date.now(),
        files: []
    };
    
    console.log('请求体:', JSON.stringify(bodyObj, null, 2));
    
    const parsedUrl = url.parse(config.url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.path,
        method: 'POST',
        headers: headers
    };
    
    console.log('请求选项:', options);
    
    let fullResponse = '';
    
    const req = protocol.request(options, (res) => {
        console.log(`响应状态: ${res.statusCode}`);
        console.log('响应头:', res.headers);
        
        if (res.statusCode < 200 || res.statusCode >= 300) {
            let errorBody = '';
            res.on('data', chunk => errorBody += chunk);
            res.on('end', () => {
                console.error('错误响应:', errorBody);
            });
            return;
        }
        
        res.setEncoding('utf8');
        
        let buffer = '';
        
        res.on('data', (chunk) => {
            console.log('收到数据块:', chunk);
            buffer += chunk;
            
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (!trimmedLine) continue;
                
                if (trimmedLine.startsWith('data: ')) {
                    const dataStr = trimmedLine.slice(6);
                    console.log('SSE数据:', dataStr);
                    
                    if (dataStr === '[DONE]') {
                        console.log('流结束信号');
                        return;
                    }
                    
                    try {
                        const data = JSON.parse(dataStr);
                        console.log('解析的数据:', data);
                        
                        if (data.event === 'message' && data.answer !== undefined) {
                            fullResponse += data.answer;
                            console.log('累积响应:', fullResponse);
                        } else if (data.event === 'message_end') {
                            console.log('消息结束');
                        }
                    } catch (e) {
                        console.error('解析错误:', e);
                    }
                }
            }
        });
        
        res.on('end', () => {
            console.log('响应结束');
            console.log('最终响应:', fullResponse || '未收到有效响应');
        });
    });
    
    req.on('error', (e) => {
        console.error('请求错误:', e);
    });
    
    req.write(JSON.stringify(bodyObj));
    req.end();
}

// 运行测试
testDifyAPI();
import { Card, CardBody, Input, Button, Divider } from '@nextui-org/react';
import React from 'react';
import { useConfig } from '../../../hooks';
import { useTranslation } from 'react-i18next';

export default function Config() {
    const [apiKey, setApiKey] = useConfig('ai_selection_api_key', '');
    const [apiUrl, setApiUrl] = useConfig('ai_selection_api_url', 'http://aifoundry.unisoc.com:8099/v1');
    const { t } = useTranslation();

    return (
        <div className='space-y-4'>
            <Card shadow='none' className='bg-content1'>
                <CardBody className='p-4'>
                    <h3 className='text-lg font-semibold mb-4'>AI API 设置</h3>
                    
                    <div className='space-y-4'>
                        <Input
                            label="API Key"
                            placeholder="输入你的API Key"
                            type="password"
                            value={apiKey}
                            onValueChange={setApiKey}
                            description="用于访问AI服务的API密钥"
                        />
                        
                        <Input
                            label="API URL"
                            placeholder="输入API服务地址"
                            value={apiUrl}
                            onValueChange={setApiUrl}
                            description="AI服务的API端点地址"
                        />
                    </div>
                </CardBody>
            </Card>

            <Card shadow='none' className='bg-content1'>
                <CardBody className='p-4'>
                    <h3 className='text-lg font-semibold mb-4'>使用说明</h3>
                    
                    <div className='space-y-2 text-sm text-default-600'>
                        <p>1. 设置API Key和API URL</p>
                        <p>2. 在桌面选择文本后，会弹出AI划词窗口</p>
                        <p>3. 点击"添加按钮"创建自定义AI功能</p>
                        <p>4. 在提示词中可以使用 {"{text}"} 来引用选中的文本</p>
                        <p>5. 点击按钮即可调用AI服务并流式显示结果</p>
                    </div>
                </CardBody>
            </Card>

            <Card shadow='none' className='bg-content1'>
                <CardBody className='p-4'>
                    <h3 className='text-lg font-semibold mb-4'>示例提示词</h3>
                    
                    <div className='space-y-3'>
                        <div className='p-3 bg-content2 rounded'>
                            <div className='font-medium mb-1'>翻译</div>
                            <div className='text-sm text-default-600'>
                                请将以下文本翻译成中文：{"{text}"}
                            </div>
                        </div>
                        
                        <div className='p-3 bg-content2 rounded'>
                            <div className='font-medium mb-1'>总结</div>
                            <div className='text-sm text-default-600'>
                                请总结以下文本的主要内容：{"{text}"}
                            </div>
                        </div>
                        
                        <div className='p-3 bg-content2 rounded'>
                            <div className='font-medium mb-1'>代码解释</div>
                            <div className='text-sm text-default-600'>
                                请解释以下代码的功能：{"{text}"}
                            </div>
                        </div>
                        
                        <div className='p-3 bg-content2 rounded'>
                            <div className='font-medium mb-1'>语法检查</div>
                            <div className='text-sm text-default-600'>
                                请检查以下文本的语法错误并给出修改建议：{"{text}"}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
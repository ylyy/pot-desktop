import { Card, CardBody, Input, Button, Divider, Switch } from '@nextui-org/react';
import React from 'react';
import { useConfig } from '../../../hooks';
import { useTranslation } from 'react-i18next';

export default function AI() {
    const [apiKey, setApiKey] = useConfig('ai_selection_api_key', '');
    const [apiUrl, setApiUrl] = useConfig('ai_selection_api_url', 'http://aifoundry.unisoc.com:8099/v1');
    const [autoCopy, setAutoCopy] = useConfig('ai_selection_auto_copy', false);
    const [closeOnFocusLost, setCloseOnFocusLost] = useConfig('ai_selection_close_on_blur', true);
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
                    <h3 className='text-lg font-semibold mb-4'>行为设置</h3>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <div>
                                <div className='font-medium'>自动复制AI响应</div>
                                <div className='text-sm text-default-500'>AI响应完成后自动复制到剪贴板</div>
                            </div>
                            <Switch 
                                isSelected={autoCopy} 
                                onValueChange={setAutoCopy}
                            />
                        </div>
                        <div className='flex justify-between items-center'>
                            <div>
                                <div className='font-medium'>失去焦点时关闭窗口</div>
                                <div className='text-sm text-default-500'>点击窗口外部时自动关闭AI划词窗口</div>
                            </div>
                            <Switch 
                                isSelected={closeOnFocusLost} 
                                onValueChange={setCloseOnFocusLost}
                            />
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card shadow='none' className='bg-content1'>
                <CardBody className='p-4'>
                    <h3 className='text-lg font-semibold mb-4'>使用说明</h3>
                    <div className='space-y-3 text-sm text-default-600'>
                        <p>1. 首先配置API Key和API URL</p>
                        <p>2. 使用快捷键或系统托盘菜单触发AI划词功能</p>
                        <p>3. 选择文本后，点击自定义按钮获取AI分析</p>
                        <p>4. 支持在提示词中使用 <code className='bg-default-100 px-1 rounded'>{'{text}'}</code> 变量</p>
                    </div>
                    
                    <Divider className='my-4' />
                    
                    <h4 className='font-semibold mb-2'>示例提示词</h4>
                    <div className='space-y-2 text-sm'>
                        <div className='bg-default-50 p-2 rounded'>
                            <div className='font-medium'>翻译</div>
                            <div className='text-default-600'>请将以下文本翻译成中文：{'{text}'}</div>
                        </div>
                        <div className='bg-default-50 p-2 rounded'>
                            <div className='font-medium'>总结</div>
                            <div className='text-default-600'>请总结以下文本的主要内容：{'{text}'}</div>
                        </div>
                        <div className='bg-default-50 p-2 rounded'>
                            <div className='font-medium'>分析</div>
                            <div className='text-default-600'>请分析以下文本的情感倾向：{'{text}'}</div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
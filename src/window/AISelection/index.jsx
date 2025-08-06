import { appWindow, currentMonitor } from '@tauri-apps/api/window';
import { Spacer, Button, Card, CardBody, CardFooter, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Textarea } from '@nextui-org/react';
import { AiFillCloseCircle } from 'react-icons/ai';
import { BsPinFill } from 'react-icons/bs';
import { MdAdd, MdDelete, MdSettings, MdContentCopy, MdClear } from 'react-icons/md';
import React, { useState, useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/tauri';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import { info } from 'tauri-plugin-log-api';
import { useConfig } from '../../hooks';
import { store } from '../../utils/store';
import { osType } from '../../utils/env';
import './style.css';

let blurTimeout = null;

const listenBlur = () => {
    return listen('tauri://blur', () => {
        if (appWindow.label === 'ai_selection') {
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            info('Blur');
            blurTimeout = setTimeout(async () => {
                info('Confirm Blur');
                await appWindow.close();
            }, 100);
        }
    });
};

let unlisten = listenBlur();

const unlistenBlur = () => {
    unlisten.then((f) => {
        f();
    });
};

void listen('tauri://focus', () => {
    info('Focus');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});

void listen('tauri://move', () => {
    info('Move');
    if (blurTimeout) {
        info('Cancel Close');
        clearTimeout(blurTimeout);
    }
});

export default function AISelection() {
    const [closeOnBlur] = useConfig('ai_selection_close_on_blur', true);
    const [alwaysOnTop] = useConfig('ai_selection_always_on_top', false);
    const [autoCopy] = useConfig('ai_selection_auto_copy', false);
    const [customButtons, setCustomButtons] = useConfig('ai_selection_custom_buttons', [
        {
            name: '翻译',
            prompt: '请将以下文本翻译成中文：{text}'
        },
        {
            name: '总结',
            prompt: '请总结以下文本的主要内容：{text}'
        },
        {
            name: '代码解释',
            prompt: '请解释以下代码的功能：{text}'
        }
    ]);
    const [apiKey] = useConfig('ai_selection_api_key', '');
    const [apiUrl] = useConfig('ai_selection_api_url', 'http://aifoundry.unisoc.com:8099/v1');
    const [selectedText, setSelectedText] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [pined, setPined] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [editingButton, setEditingButton] = useState(null);
    const [buttonName, setButtonName] = useState('');
    const [buttonPrompt, setButtonPrompt] = useState('');
    const responseRef = useRef(null);
    const { t } = useTranslation();

    useEffect(() => {
        if (closeOnBlur !== null && !closeOnBlur) {
            unlistenBlur();
        }
    }, [closeOnBlur]);

    useEffect(() => {
        if (alwaysOnTop !== null && alwaysOnTop) {
            appWindow.setAlwaysOnTop(true);
            unlistenBlur();
            setPined(true);
        }
    }, [alwaysOnTop]);

    useEffect(() => {
        if (unlisten) {
            unlisten = listen('new_text', (event) => {
                appWindow.setFocus();
                handleNewText(event.payload);
            });
        }
    }, []);

    useEffect(() => {
        invoke('get_text').then((v) => {
            handleNewText(v);
        });
    }, []);

    useEffect(() => {
        if (responseRef.current) {
            responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
    }, [aiResponse]);

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && event.ctrlKey) {
                event.preventDefault();
                if (customButtons.length > 0 && !isLoading) {
                    callAI(customButtons[0].prompt);
                }
            }
            if (event.key === 'Escape') {
                appWindow.close();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [customButtons, isLoading]);

    const handleNewText = (text) => {
        text = text.trim();
        if (text && text !== '[SELECTION_TRANSLATE]') {
            setSelectedText(text);
            appWindow.show();
            appWindow.setFocus();
        }
    };

    const callAI = async (prompt) => {
        if (!apiKey) {
            setError('请先设置API Key');
            return;
        }

        setIsLoading(true);
        setAiResponse('');
        setError('');

        // 替换提示词中的模板变量
        let processedPrompt = prompt;
        if (selectedText && selectedText.trim()) {
            processedPrompt = prompt.replace(/{text}/g, selectedText);
        } else {
            // 如果没有选中文本，移除{text}占位符或使用默认文本
            processedPrompt = prompt.replace(/{text}/g, '请提供一些内容');
        }

        try {
            const response = await fetch(`${apiUrl}/chat-messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs: {},
                    query: processedPrompt,
                    response_mode: "streaming",
                    conversation_id: "",
                    user: "ai-selection-user",
                    files: []
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.event === 'message' && data.answer) {
                                setAiResponse(prev => prev + data.answer);
                            }
                        } catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (error) {
            console.error('AI调用错误:', error);
            setError('AI调用失败: ' + error.message);
        } finally {
            setIsLoading(false);
            // 如果启用了自动复制，在AI响应完成后复制到剪贴板
            if (autoCopy && aiResponse.trim()) {
                try {
                    await writeText(aiResponse);
                } catch (error) {
                    console.error('复制到剪贴板失败:', error);
                }
            }
        }
    };

    const addCustomButton = () => {
        setEditingButton(null);
        setButtonName('');
        setButtonPrompt('');
        onOpen();
    };

    const editCustomButton = (button) => {
        setEditingButton(button);
        setButtonName(button.name);
        setButtonPrompt(button.prompt);
        onOpen();
    };

    const deleteCustomButton = (index) => {
        const newButtons = customButtons.filter((_, i) => i !== index);
        setCustomButtons(newButtons);
    };

    const saveCustomButton = () => {
        if (!buttonName.trim() || !buttonPrompt.trim()) {
            alert('请填写按钮名称和提示词');
            return;
        }

        if (editingButton) {
            // 编辑现有按钮
            const newButtons = customButtons.map(btn => 
                btn === editingButton 
                    ? { name: buttonName.trim(), prompt: buttonPrompt.trim() }
                    : btn
            );
            setCustomButtons(newButtons);
        } else {
            // 添加新按钮
            setCustomButtons([...customButtons, {
                name: buttonName.trim(),
                prompt: buttonPrompt.trim()
            }]);
        }

        onClose();
    };

    return (
        <div className={`bg-content1 h-screen w-screen ${
            osType === 'Linux' && 'rounded-[10px] border-1 border-default-100'
        }`}>
            <div className='fixed top-[5px] left-[5px] right-[5px] h-[30px]' data-tauri-drag-region='true' />
            
            <div className={`h-[35px] w-full flex ${osType === 'Darwin' ? 'justify-end' : 'justify-between'}`}>
                <div className='flex items-center gap-2'>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className='my-auto bg-transparent'
                        onPress={() => {
                            if (pined) {
                                if (closeOnBlur) {
                                    unlisten = listenBlur();
                                }
                                appWindow.setAlwaysOnTop(false);
                            } else {
                                unlistenBlur();
                                appWindow.setAlwaysOnTop(true);
                            }
                            setPined(!pined);
                        }}
                    >
                        <BsPinFill className={`text-[20px] ${pined ? 'text-primary' : 'text-default-400'}`} />
                    </Button>
                    <Button
                        isIconOnly
                        size='sm'
                        variant='flat'
                        disableAnimation
                        className='my-auto bg-transparent'
                        onPress={() => {
                            invoke('open_config_window');
                        }}
                    >
                        <MdSettings className='text-[20px] text-default-400' />
                    </Button>
                </div>
                <Button
                    isIconOnly
                    size='sm'
                    variant='flat'
                    disableAnimation
                    className={`my-auto ${osType === 'Darwin' && 'hidden'} bg-transparent`}
                    onPress={() => {
                        void appWindow.close();
                    }}
                >
                    <AiFillCloseCircle className='text-[20px] text-default-400' />
                </Button>
            </div>

            <div className={`${osType === 'Linux' ? 'h-[calc(100vh-37px)]' : 'h-[calc(100vh-35px)]'} px-[8px]`}>
                <div className='h-full flex flex-col'>
                    {/* 选中的文本 */}
                    <Card shadow='none' className='bg-content1 rounded-[10px] mb-2'>
                        <CardBody className='bg-content1 p-[12px]'>
                            <div className='text-sm text-default-600 mb-2'>选中的文本：</div>
                            <div className='text-sm bg-content2 p-2 rounded min-h-[60px] max-h-[120px] overflow-y-auto'>
                                {selectedText || '暂无选中文本'}
                            </div>
                        </CardBody>
                    </Card>

                    {/* 自定义按钮区域 */}
                    <Card shadow='none' className='bg-content1 rounded-[10px] mb-2'>
                        <CardBody className='bg-content1 p-[12px]'>
                            <div className='flex justify-between items-center mb-2'>
                                <div className='flex items-center gap-2'>
                                    <div className='text-sm text-default-600'>自定义AI功能：</div>
                                    <div className='text-xs text-default-400'>
                                        (Ctrl+Enter 快速调用第一个功能，无需选中文本)
                                    </div>
                                </div>
                                <Button
                                    size='sm'
                                    color='primary'
                                    variant='flat'
                                    startContent={<MdAdd />}
                                    onPress={addCustomButton}
                                >
                                    添加按钮
                                </Button>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {customButtons.map((button, index) => (
                                    <Button
                                        key={index}
                                        size='sm'
                                        color='secondary'
                                        variant='flat'
                                        isDisabled={isLoading}
                                        onPress={() => callAI(button.prompt)}
                                        className='relative group'
                                    >
                                        {button.name}
                                        <Button
                                            isIconOnly
                                            size='sm'
                                            variant='light'
                                            className='absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                            onPress={() => editCustomButton(button)}
                                        >
                                            <MdAdd className='text-xs rotate-45' />
                                        </Button>
                                        <Button
                                            isIconOnly
                                            size='sm'
                                            variant='light'
                                            className='absolute -top-1 -right-6 opacity-0 group-hover:opacity-100 transition-opacity'
                                            onPress={() => deleteCustomButton(index)}
                                        >
                                            <MdDelete className='text-xs' />
                                        </Button>
                                    </Button>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* AI响应区域 */}
                    <Card shadow='none' className='bg-content1 rounded-[10px] flex-1'>
                        <CardBody className='bg-content1 p-[12px] flex-1'>
                            <div className='flex justify-between items-center mb-2'>
                                <div className='text-sm text-default-600'>AI响应：</div>
                                <div className='flex gap-1'>
                                    {aiResponse && (
                                        <>
                                            <Button
                                                isIconOnly
                                                size='sm'
                                                variant='light'
                                                onPress={() => {
                                                    writeText(aiResponse);
                                                }}
                                            >
                                                <MdContentCopy className='text-[16px]' />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size='sm'
                                                variant='light'
                                                onPress={() => {
                                                    setAiResponse('');
                                                }}
                                            >
                                                <MdClear className='text-[16px]' />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div 
                                ref={responseRef}
                                className='text-sm bg-content2 p-2 rounded flex-1 overflow-y-auto min-h-[200px] whitespace-pre-wrap'
                            >
                                {isLoading ? (
                                    <div className='flex items-center gap-2'>
                                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary'></div>
                                        <span>正在生成...</span>
                                    </div>
                                ) : error ? (
                                    <div className='text-red-500'>
                                        <div className='font-medium mb-2'>错误：</div>
                                        <div>{error}</div>
                                        <Button
                                            size='sm'
                                            color='primary'
                                            variant='flat'
                                            className='mt-2'
                                            onPress={() => setError('')}
                                        >
                                            清除错误
                                        </Button>
                                    </div>
                                ) : aiResponse || '点击上方按钮开始AI对话，无需选中文本'}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>

            {/* 添加/编辑按钮的模态框 */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader>
                        {editingButton ? '编辑按钮' : '添加按钮'}
                    </ModalHeader>
                    <ModalBody>
                        <Input
                            label="按钮名称"
                            placeholder="输入按钮显示的名称"
                            value={buttonName}
                            onValueChange={setButtonName}
                        />
                        <Textarea
                            label="提示词"
                            placeholder="输入AI提示词，可以使用 {text} 来引用选中的文本"
                            value={buttonPrompt}
                            onValueChange={setButtonPrompt}
                            minRows={3}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={onClose}>
                            取消
                        </Button>
                        <Button color="primary" onPress={saveCustomButton}>
                            保存
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
# Windows 构建产物说明

## 构建成功！

已成功生成Windows版本的AI划词应用程序。

## 文件位置

- **可执行文件**: `src-tauri/target/x86_64-pc-windows-gnu/release/pot.exe`
- **安装包**: `src-tauri/target/x86_64-pc-windows-gnu/release/pot-app-windows.zip`

## 文件信息

- **exe文件大小**: 75MB
- **zip包大小**: 42MB
- **架构**: x86-64 (64位Windows)
- **类型**: PE32+ executable (GUI)

## 使用方法

### 方法1: 直接运行exe文件
1. 下载 `pot.exe` 文件
2. 双击运行即可

### 方法2: 使用安装包
1. 下载 `pot-app-windows.zip` 文件
2. 解压到任意目录
3. 运行 `pot.exe`

## 功能特性

- ✅ 桌面AI划词功能
- ✅ 流式AI响应显示
- ✅ 自定义按钮和提示词
- ✅ 系统托盘集成
- ✅ 全局快捷键支持
- ✅ 配置窗口

## 系统要求

- Windows 10/11 (64位)
- 需要安装WebView2 Runtime (通常Windows 10/11已预装)

## 注意事项

1. 首次运行可能需要配置API Key和API URL
2. 建议将程序添加到系统托盘，方便使用
3. 可以通过系统托盘菜单或快捷键触发AI划词功能

## 技术说明

- 使用Tauri框架构建
- 前端: React + NextUI
- 后端: Rust
- 交叉编译: Linux → Windows (x86_64-pc-windows-gnu)

构建时间: 2024年8月6日
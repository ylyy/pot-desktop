#!/bin/bash

echo "==================================="
echo "AI划词助手 - Electron 应用打包脚本"
echo "==================================="

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "错误：未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

# 检查是否安装了 npm
if ! command -v npm &> /dev/null; then
    echo "错误：未检测到 npm，请先安装 npm"
    exit 1
fi

echo ""
echo "1. 安装依赖..."
echo "-----------------------------------"
npm install

echo ""
echo "2. 生成应用图标..."
echo "-----------------------------------"
node generate-icon.js

echo ""
echo "3. 开始打包应用..."
echo "-----------------------------------"

# 根据系统选择打包命令
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    echo "检测到 Windows 系统，开始打包 Windows 版本..."
    npm run dist:win
else
    # Linux/Mac 上交叉编译 Windows
    echo "开始打包 Windows 版本（交叉编译）..."
    npm run dist:win
fi

echo ""
echo "==================================="
echo "打包完成！"
echo "==================================="
echo ""
echo "输出文件位置："
echo "- 安装程序: dist/AI划词助手 Setup *.exe"
echo "- 便携版: dist/win-unpacked/"
echo ""
echo "提示："
echo "1. 安装程序包含自动更新功能"
echo "2. 便携版可以直接运行，无需安装"
echo "3. 首次运行可能需要允许防火墙访问"
echo ""
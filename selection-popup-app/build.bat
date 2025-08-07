@echo off
chcp 65001 > nul
title AI划词助手 - 打包工具

echo ===================================
echo AI划词助手 - Electron 应用打包脚本
echo ===================================

REM 检查 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未检测到 Node.js，请先安装 Node.js
    echo 下载地址：https://nodejs.org/
    pause
    exit /b 1
)

REM 检查 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未检测到 npm，请先安装 npm
    pause
    exit /b 1
)

echo.
echo 1. 安装依赖...
echo -----------------------------------
call npm install

echo.
echo 2. 生成应用图标...
echo -----------------------------------
call node generate-icon.js

echo.
echo 3. 开始打包应用...
echo -----------------------------------
echo 正在打包 Windows 版本...
call npm run dist:win

echo.
echo ===================================
echo 打包完成！
echo ===================================
echo.
echo 输出文件位置：
echo - 安装程序: dist\AI划词助手 Setup *.exe
echo - 便携版: dist\win-unpacked\
echo.
echo 提示：
echo 1. 安装程序包含自动更新功能
echo 2. 便携版可以直接运行，无需安装
echo 3. 首次运行可能需要允许防火墙访问
echo.
pause
#!/bin/bash

echo "检查打包状态..."
echo "=================="

# 检查 dist 目录是否存在
if [ -d "dist" ]; then
    echo "✓ 找到 dist 目录"
    echo ""
    echo "目录内容："
    ls -la dist/
    echo ""
    
    # 检查是否有 exe 文件
    if ls dist/*.exe 1> /dev/null 2>&1; then
        echo "✓ 找到 EXE 文件："
        ls -lh dist/*.exe
    else
        echo "✗ 未找到 EXE 文件"
    fi
    
    # 检查 win-unpacked 目录
    if [ -d "dist/win-unpacked" ]; then
        echo ""
        echo "✓ 找到便携版目录 (win-unpacked)"
        echo "主程序: dist/win-unpacked/AI划词助手.exe"
    fi
else
    echo "✗ dist 目录不存在，打包可能还在进行中或失败"
fi

echo ""
echo "如果打包仍在进行，请稍候片刻..."
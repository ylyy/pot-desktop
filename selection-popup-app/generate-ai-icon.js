const fs = require('fs');
const path = require('path');

// 生成带 AI 标记的鼠标图标
function generateAIMouseIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // 清除背景
    ctx.clearRect(0, 0, size, size);
    
    // 设置抗锯齿
    ctx.imageSmoothingEnabled = true;
    
    // 背景圆形
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.45;
    
    // 渐变背景
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 绘制鼠标形状
    const mouseScale = 0.5;
    const mouseWidth = size * 0.3 * mouseScale;
    const mouseHeight = size * 0.45 * mouseScale;
    const mouseX = centerX - mouseWidth / 2;
    const mouseY = centerY - mouseHeight / 2 - size * 0.05;
    
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = size * 0.02;
    
    // 鼠标主体
    ctx.beginPath();
    ctx.moveTo(mouseX + mouseWidth / 2, mouseY);
    ctx.lineTo(mouseX + mouseWidth * 0.85, mouseY + mouseHeight * 0.3);
    ctx.lineTo(mouseX + mouseWidth * 0.7, mouseY + mouseHeight * 0.5);
    ctx.lineTo(mouseX + mouseWidth * 0.7, mouseY + mouseHeight * 0.85);
    ctx.quadraticCurveTo(mouseX + mouseWidth / 2, mouseY + mouseHeight, mouseX + mouseWidth * 0.3, mouseY + mouseHeight * 0.85);
    ctx.lineTo(mouseX + mouseWidth * 0.3, mouseY + mouseHeight * 0.5);
    ctx.lineTo(mouseX + mouseWidth * 0.15, mouseY + mouseHeight * 0.3);
    ctx.closePath();
    ctx.fill();
    
    // 鼠标中线
    ctx.beginPath();
    ctx.moveTo(mouseX + mouseWidth / 2, mouseY + mouseHeight * 0.1);
    ctx.lineTo(mouseX + mouseWidth / 2, mouseY + mouseHeight * 0.4);
    ctx.stroke();
    
    // AI 文字
    ctx.font = `bold ${size * 0.2}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    
    // AI 文字放在鼠标右上角
    const aiX = centerX + size * 0.15;
    const aiY = centerY + size * 0.1;
    
    // AI 背景圆圈
    ctx.beginPath();
    ctx.arc(aiX, aiY, size * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = '#ff6b6b';
    ctx.fill();
    
    // AI 文字
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.12}px Arial`;
    ctx.fillText('AI', aiX, aiY);
    
    return canvas.toBuffer('image/png');
}

// 生成不同尺寸的 PNG 图标
const sizes = [16, 32, 48, 64, 128, 256];
const outputDir = path.join(__dirname, 'assets');

// 确保目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 检查是否安装了 canvas
try {
    require.resolve('canvas');
} catch (e) {
    console.log('需要安装 canvas 包来生成图标。');
    console.log('请运行: npm install canvas');
    console.log('');
    console.log('作为替代，创建一个简单的 SVG 图标...');
    
    // 创建 SVG 图标作为替代
    const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <!-- 背景 -->
  <defs>
    <radialGradient id="bg-gradient">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="115" fill="url(#bg-gradient)"/>
  
  <!-- 鼠标形状 -->
  <g transform="translate(128, 120)">
    <path d="M -25,-40 L -25,20 Q -25,40 0,40 Q 25,40 25,20 L 25,-40 Q 25,-50 0,-50 Q -25,-50 -25,-40 Z" 
          fill="white" stroke="none"/>
    <line x1="0" y1="-45" x2="0" y2="-10" stroke="#667eea" stroke-width="3"/>
    <line x1="0" y1="-10" x2="0" y2="15" stroke="#667eea" stroke-width="1.5"/>
  </g>
  
  <!-- AI 标记 -->
  <circle cx="170" cy="90" r="30" fill="#ff6b6b"/>
  <text x="170" y="95" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
        text-anchor="middle" fill="white">AI</text>
</svg>`;
    
    fs.writeFileSync(path.join(outputDir, 'icon.svg'), svgIcon);
    fs.writeFileSync(path.join(outputDir, 'icon.png'), Buffer.from(svgIcon));
    fs.writeFileSync(path.join(outputDir, 'tray-icon.png'), Buffer.from(svgIcon));
    
    console.log('SVG 图标已创建:', path.join(outputDir, 'icon.svg'));
    console.log('提示：您可以使用在线工具将 SVG 转换为 ICO 格式');
    process.exit(0);
}

// 生成图标
console.log('生成 AI 鼠标图标...');

try {
    // 生成主图标
    const mainIcon = generateAIMouseIcon(256);
    fs.writeFileSync(path.join(outputDir, 'icon.png'), mainIcon);
    console.log('主图标已生成:', path.join(outputDir, 'icon.png'));
    
    // 生成托盘图标（较小）
    const trayIcon = generateAIMouseIcon(32);
    fs.writeFileSync(path.join(outputDir, 'tray-icon.png'), trayIcon);
    console.log('托盘图标已生成:', path.join(outputDir, 'tray-icon.png'));
    
    // 为 Windows 生成不同尺寸
    sizes.forEach(size => {
        const icon = generateAIMouseIcon(size);
        fs.writeFileSync(path.join(outputDir, `icon-${size}.png`), icon);
        console.log(`生成 ${size}x${size} 图标`);
    });
    
    console.log('\n图标生成完成！');
    console.log('提示：要创建 ICO 文件，您可以：');
    console.log('1. 使用在线工具如 https://convertio.co/png-ico/');
    console.log('2. 或安装 png-to-ico: npm install -g png-to-ico');
    console.log('   然后运行: png-to-ico assets/icon-256.png > assets/icon.ico');
    
} catch (error) {
    console.error('生成图标时出错:', error);
}
const fs = require('fs');
const path = require('path');

// 创建一个简单的 PNG 文件（256x256）
function createSimplePNG() {
    const width = 256;
    const height = 256;
    
    // PNG 文件签名
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    
    // IHDR chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData.writeUInt8(8, 8); // bit depth
    ihdrData.writeUInt8(6, 9); // color type (RGBA)
    ihdrData.writeUInt8(0, 10); // compression
    ihdrData.writeUInt8(0, 11); // filter
    ihdrData.writeUInt8(0, 12); // interlace
    
    // 创建图像数据
    const imageData = [];
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 115;
    
    for (let y = 0; y < height; y++) {
        imageData.push(0); // filter type
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= radius) {
                // 渐变背景色
                const t = dist / radius;
                const r = Math.floor(102 + (1 - t) * 50);
                const g = Math.floor(126 + (1 - t) * 40);
                const b = Math.floor(234 - t * 70);
                
                // 检查是否在鼠标区域
                const mouseX = Math.abs(dx);
                const mouseY = dy + 10;
                if (mouseX < 30 && mouseY > -45 && mouseY < 45) {
                    // 鼠标形状（简化）
                    if (mouseY < -15 || (mouseX < 20 && mouseY < 30)) {
                        imageData.push(255, 255, 255, 255); // 白色
                        continue;
                    }
                }
                
                // AI 标记区域
                const aiX = dx - 47;
                const aiY = dy + 43;
                const aiDist = Math.sqrt(aiX * aiX + aiY * aiY);
                if (aiDist < 32) {
                    imageData.push(255, 107, 107, 255); // 红色
                    continue;
                }
                
                imageData.push(r, g, b, 255);
            } else {
                imageData.push(0, 0, 0, 0); // 透明
            }
        }
    }
    
    // 压缩数据（简化版，实际应使用 zlib）
    const rawData = Buffer.from(imageData);
    
    // 创建 chunk
    function createChunk(type, data) {
        const length = Buffer.alloc(4);
        length.writeUInt32BE(data.length);
        const typeBuffer = Buffer.from(type);
        const crc = Buffer.alloc(4); // 简化，应计算实际 CRC
        return Buffer.concat([length, typeBuffer, data, crc]);
    }
    
    // 组合 PNG 文件
    const ihdr = createChunk('IHDR', ihdrData);
    const idat = createChunk('IDAT', rawData);
    const iend = createChunk('IEND', Buffer.alloc(0));
    
    return Buffer.concat([signature, ihdr, idat, iend]);
}

// 创建简化的 BMP 作为 PNG 的替代
function createBMP() {
    const width = 256;
    const height = 256;
    const bytesPerPixel = 3;
    const rowSize = Math.ceil(width * bytesPerPixel / 4) * 4;
    const pixelDataSize = rowSize * height;
    const headerSize = 54;
    const fileSize = headerSize + pixelDataSize;
    
    const buffer = Buffer.alloc(fileSize);
    
    // BMP 文件头
    buffer.write('BM', 0);
    buffer.writeUInt32LE(fileSize, 2);
    buffer.writeUInt32LE(0, 6);
    buffer.writeUInt32LE(headerSize, 10);
    
    // DIB 头
    buffer.writeUInt32LE(40, 14); // 头大小
    buffer.writeInt32LE(width, 18);
    buffer.writeInt32LE(height, 22);
    buffer.writeUInt16LE(1, 26); // planes
    buffer.writeUInt16LE(24, 28); // bits per pixel
    buffer.writeUInt32LE(0, 30); // compression
    buffer.writeUInt32LE(pixelDataSize, 34);
    
    // 像素数据
    let offset = headerSize;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 115;
    
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist <= radius) {
                // 渐变背景
                const t = dist / radius;
                const r = Math.floor(102 + (1 - t) * 50);
                const g = Math.floor(126 + (1 - t) * 40);
                const b = Math.floor(234 - t * 70);
                
                buffer.writeUInt8(b, offset++);
                buffer.writeUInt8(g, offset++);
                buffer.writeUInt8(r, offset++);
            } else {
                buffer.writeUInt8(255, offset++);
                buffer.writeUInt8(255, offset++);
                buffer.writeUInt8(255, offset++);
            }
        }
        offset += rowSize - width * bytesPerPixel;
    }
    
    return buffer;
}

// 生成文件
const outputDir = path.join(__dirname, 'assets');

console.log('创建图标文件...');

try {
    // 创建 BMP 文件作为图标
    const bmpData = createBMP();
    fs.writeFileSync(path.join(outputDir, 'icon.bmp'), bmpData);
    console.log('BMP 图标已创建:', path.join(outputDir, 'icon.bmp'));
    
    // 复制为 PNG（临时解决方案）
    fs.writeFileSync(path.join(outputDir, 'icon.png'), bmpData);
    fs.writeFileSync(path.join(outputDir, 'tray-icon.png'), bmpData);
    
    console.log('\n提示：');
    console.log('1. 已创建 BMP 格式的图标文件');
    console.log('2. 建议使用图像编辑软件（如 GIMP、Photoshop）打开 icon.svg');
    console.log('3. 然后导出为 PNG 格式，并使用在线工具转换为 ICO');
    console.log('4. 推荐的在线转换工具：');
    console.log('   - https://convertio.co/svg-png/');
    console.log('   - https://cloudconvert.com/svg-to-ico');
    
} catch (error) {
    console.error('创建图标时出错:', error);
}
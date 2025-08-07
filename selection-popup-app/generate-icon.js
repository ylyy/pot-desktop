const fs = require('fs');
const path = require('path');

// 创建一个简单的 ICO 文件生成器
// 注意：这只是一个占位图标，实际应用中建议使用专业的图标

// 创建一个简单的 BMP 数据（用于 ICO 文件）
function createSimpleBMP(size) {
    // BMP 文件头
    const fileHeaderSize = 14;
    const infoHeaderSize = 40;
    const pixelDataOffset = fileHeaderSize + infoHeaderSize;
    const bytesPerPixel = 4;
    const rowSize = Math.floor((size * bytesPerPixel + 3) / 4) * 4;
    const pixelDataSize = rowSize * size;
    const fileSize = pixelDataOffset + pixelDataSize;

    const buffer = Buffer.alloc(fileSize);
    let offset = 0;

    // 文件头
    buffer.write('BM', offset); offset += 2;
    buffer.writeUInt32LE(fileSize, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(pixelDataOffset, offset); offset += 4;

    // 信息头
    buffer.writeUInt32LE(infoHeaderSize, offset); offset += 4;
    buffer.writeInt32LE(size, offset); offset += 4;
    buffer.writeInt32LE(size, offset); offset += 4;
    buffer.writeUInt16LE(1, offset); offset += 2;
    buffer.writeUInt16LE(32, offset); offset += 2;
    buffer.writeUInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(pixelDataSize, offset); offset += 4;
    buffer.writeInt32LE(0, offset); offset += 4;
    buffer.writeInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;
    buffer.writeUInt32LE(0, offset); offset += 4;

    // 像素数据（创建一个简单的渐变图标）
    offset = pixelDataOffset;
    for (let y = size - 1; y >= 0; y--) {
        for (let x = 0; x < size; x++) {
            // 创建一个紫色渐变背景
            const r = Math.floor(102 + (x / size) * 50);
            const g = Math.floor(126 - (y / size) * 30);
            const b = Math.floor(234 - (x / size) * 70);
            
            // 在中心绘制一个简单的 AI 字母
            const centerX = size / 2;
            const centerY = size / 2;
            const radius = size * 0.3;
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            
            if (dist < radius) {
                // 白色圆形背景
                buffer.writeUInt8(255, offset++); // B
                buffer.writeUInt8(255, offset++); // G
                buffer.writeUInt8(255, offset++); // R
                buffer.writeUInt8(255, offset++); // A
            } else {
                buffer.writeUInt8(b, offset++);   // B
                buffer.writeUInt8(g, offset++);   // G
                buffer.writeUInt8(r, offset++);   // R
                buffer.writeUInt8(255, offset++); // A
            }
        }
        // 填充到行边界
        offset += rowSize - (size * bytesPerPixel);
    }

    return buffer;
}

// 创建 ICO 文件
function createICO() {
    const sizes = [16, 32, 48, 256];
    const images = sizes.map(size => createSimpleBMP(size));
    
    // ICO 文件头
    const iconDirSize = 6;
    const iconDirEntrySize = 16;
    const headerSize = iconDirSize + (iconDirEntrySize * sizes.length);
    
    let totalSize = headerSize;
    const offsets = [];
    
    for (const img of images) {
        offsets.push(totalSize);
        totalSize += img.length;
    }
    
    const ico = Buffer.alloc(totalSize);
    let offset = 0;
    
    // ICONDIR
    ico.writeUInt16LE(0, offset); offset += 2;  // Reserved
    ico.writeUInt16LE(1, offset); offset += 2;  // Type (1 = ICO)
    ico.writeUInt16LE(sizes.length, offset); offset += 2;  // Count
    
    // ICONDIRENTRY for each size
    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        ico.writeUInt8(size === 256 ? 0 : size, offset++);  // Width
        ico.writeUInt8(size === 256 ? 0 : size, offset++);  // Height
        ico.writeUInt8(0, offset++);  // ColorCount
        ico.writeUInt8(0, offset++);  // Reserved
        ico.writeUInt16LE(1, offset); offset += 2;  // Planes
        ico.writeUInt16LE(32, offset); offset += 2;  // BitCount
        ico.writeUInt32LE(images[i].length, offset); offset += 4;  // BytesInRes
        ico.writeUInt32LE(offsets[i], offset); offset += 4;  // ImageOffset
    }
    
    // Copy image data
    for (let i = 0; i < images.length; i++) {
        images[i].copy(ico, offsets[i]);
    }
    
    return ico;
}

// 生成图标文件
console.log('生成应用图标...');
const icoData = createICO();
const iconPath = path.join(__dirname, 'assets', 'icon.ico');

// 确保目录存在
if (!fs.existsSync(path.dirname(iconPath))) {
    fs.mkdirSync(path.dirname(iconPath), { recursive: true });
}

fs.writeFileSync(iconPath, icoData);
console.log('图标已生成:', iconPath);

// 同时创建一个 PNG 版本用于其他用途
const pngPath = path.join(__dirname, 'assets', 'icon.png');
const pngData = createSimpleBMP(256);

// 简单的 PNG 文件（这里只是创建占位符）
fs.writeFileSync(pngPath, Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    // ... PNG 数据需要更复杂的处理，这里简化
]));

console.log('注意：生成的是简单占位图标。建议使用专业工具创建更好的图标。');
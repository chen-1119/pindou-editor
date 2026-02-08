// 图片转拼豆工具函数

import { BEAD_COLORS } from '../data/beadColors';

// 计算两个颜色之间的距离 (使用 LAB 色彩空间近似)
function colorDistance(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);

    // 使用加权欧几里得距离 (人眼对绿色更敏感)
    const rMean = (rgb1.r + rgb2.r) / 2;
    const dR = rgb1.r - rgb2.r;
    const dG = rgb1.g - rgb2.g;
    const dB = rgb1.b - rgb2.b;

    return Math.sqrt(
        (2 + rMean / 256) * dR * dR +
        4 * dG * dG +
        (2 + (255 - rMean) / 256) * dB * dB
    );
}

// HEX 转 RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// RGB 转 HEX
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// 找到最接近的拼豆颜色
export function findClosestBeadColor(hex) {
    let minDistance = Infinity;
    let closestColor = BEAD_COLORS[0];

    for (const beadColor of BEAD_COLORS) {
        const distance = colorDistance(hex, beadColor.hex);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = beadColor;
        }
    }

    return closestColor;
}

// 将图片转换为拼豆数据
export function imageToBeads(imageData, targetWidth, targetHeight) {
    const pixels = {};
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // 绘制缩放后的图片
    ctx.drawImage(imageData, 0, 0, targetWidth, targetHeight);

    // 获取像素数据
    const data = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

    for (let y = 0; y < targetHeight; y++) {
        for (let x = 0; x < targetWidth; x++) {
            const i = (y * targetWidth + x) * 4;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3];

            // 跳过透明像素
            if (a < 128) continue;

            const hex = rgbToHex(r, g, b);
            const beadColor = findClosestBeadColor(hex);

            pixels[`${x},${y}`] = {
                colorId: beadColor.id,
                hex: beadColor.hex
            };
        }
    }

    return pixels;
}

// 统计拼豆数量
export function countBeads(pixels) {
    const counts = {};

    Object.values(pixels).forEach(pixel => {
        if (!counts[pixel.colorId]) {
            counts[pixel.colorId] = {
                colorId: pixel.colorId,
                hex: pixel.hex,
                count: 0
            };
        }
        counts[pixel.colorId].count++;
    });

    // 按数量排序
    return Object.values(counts).sort((a, b) => b.count - a.count);
}

// 加载图片
export function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

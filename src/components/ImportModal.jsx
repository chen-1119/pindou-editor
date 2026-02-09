import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Image, Wand2, RotateCcw } from 'lucide-react';
import { BEAD_COLORS } from '../data/beadColors';
import './ImportModal.css';

// 颜色工具函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// RGB 转 Lab 色彩空间（更符合人眼感知）
function rgbToLab(r, g, b) {
    // RGB 转 XYZ
    let rr = r / 255;
    let gg = g / 255;
    let bb = b / 255;

    rr = rr > 0.04045 ? Math.pow((rr + 0.055) / 1.055, 2.4) : rr / 12.92;
    gg = gg > 0.04045 ? Math.pow((gg + 0.055) / 1.055, 2.4) : gg / 12.92;
    bb = bb > 0.04045 ? Math.pow((bb + 0.055) / 1.055, 2.4) : bb / 12.92;

    const x = (rr * 0.4124564 + gg * 0.3575761 + bb * 0.1804375) / 0.95047;
    const y = (rr * 0.2126729 + gg * 0.7151522 + bb * 0.0721750);
    const z = (rr * 0.0193339 + gg * 0.1191920 + bb * 0.9503041) / 1.08883;

    // XYZ 转 Lab
    const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + 16 / 116;
    const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;
    const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + 16 / 116;

    return {
        L: (116 * fy) - 16,
        a: 500 * (fx - fy),
        b: 200 * (fy - fz)
    };
}

// CIE Delta E 2000 颜色差异算法（最精确）
function deltaE2000(lab1, lab2) {
    const L1 = lab1.L, a1 = lab1.a, b1 = lab1.b;
    const L2 = lab2.L, a2 = lab2.a, b2 = lab2.b;

    const kL = 1, kC = 1, kH = 1;
    const deg2rad = Math.PI / 180;

    const C1 = Math.sqrt(a1 * a1 + b1 * b1);
    const C2 = Math.sqrt(a2 * a2 + b2 * b2);
    const Cavg = (C1 + C2) / 2;
    const Cavg7 = Math.pow(Cavg, 7);
    const G = 0.5 * (1 - Math.sqrt(Cavg7 / (Cavg7 + Math.pow(25, 7))));

    const a1p = a1 * (1 + G);
    const a2p = a2 * (1 + G);
    const C1p = Math.sqrt(a1p * a1p + b1 * b1);
    const C2p = Math.sqrt(a2p * a2p + b2 * b2);

    let h1p = Math.atan2(b1, a1p) * 180 / Math.PI;
    if (h1p < 0) h1p += 360;
    let h2p = Math.atan2(b2, a2p) * 180 / Math.PI;
    if (h2p < 0) h2p += 360;

    const dLp = L2 - L1;
    const dCp = C2p - C1p;

    let dhp;
    if (C1p * C2p === 0) {
        dhp = 0;
    } else if (Math.abs(h2p - h1p) <= 180) {
        dhp = h2p - h1p;
    } else if (h2p - h1p > 180) {
        dhp = h2p - h1p - 360;
    } else {
        dhp = h2p - h1p + 360;
    }

    const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin(dhp * deg2rad / 2);

    const Lp = (L1 + L2) / 2;
    const Cp = (C1p + C2p) / 2;

    let Hp;
    if (C1p * C2p === 0) {
        Hp = h1p + h2p;
    } else if (Math.abs(h1p - h2p) <= 180) {
        Hp = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
        Hp = (h1p + h2p + 360) / 2;
    } else {
        Hp = (h1p + h2p - 360) / 2;
    }

    const T = 1 - 0.17 * Math.cos((Hp - 30) * deg2rad)
        + 0.24 * Math.cos(2 * Hp * deg2rad)
        + 0.32 * Math.cos((3 * Hp + 6) * deg2rad)
        - 0.20 * Math.cos((4 * Hp - 63) * deg2rad);

    const dTheta = 30 * Math.exp(-Math.pow((Hp - 275) / 25, 2));
    const Cp7 = Math.pow(Cp, 7);
    const RC = 2 * Math.sqrt(Cp7 / (Cp7 + Math.pow(25, 7)));
    const Lp50sq = Math.pow(Lp - 50, 2);
    const SL = 1 + 0.015 * Lp50sq / Math.sqrt(20 + Lp50sq);
    const SC = 1 + 0.045 * Cp;
    const SH = 1 + 0.015 * Cp * T;
    const RT = -Math.sin(2 * dTheta * deg2rad) * RC;

    return Math.sqrt(
        Math.pow(dLp / (kL * SL), 2)
        + Math.pow(dCp / (kC * SC), 2)
        + Math.pow(dHp / (kH * SH), 2)
        + RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
    );
}

// 预计算所有拼豆颜色的 Lab 值
const BEAD_COLORS_LAB = BEAD_COLORS.map(color => {
    const rgb = hexToRgb(color.hex);
    return {
        ...color,
        lab: rgbToLab(rgb.r, rgb.g, rgb.b)
    };
});

// 使用 Lab 色彩空间查找最接近的拼豆颜色 (直接使用 RGB)
function findClosestBeadColorFromRgb(r, g, b) {
    const lab = rgbToLab(r, g, b);

    let minDistance = Infinity;
    let closestColor = BEAD_COLORS[0];

    for (let i = 0; i < BEAD_COLORS_LAB.length; i++) {
        const beadColor = BEAD_COLORS_LAB[i];
        const distance = deltaE2000(lab, beadColor.lab);
        if (distance < minDistance) {
            minDistance = distance;
            closestColor = beadColor;
        }
    }

    return closestColor;
}

// 保持兼容性
function findClosestBeadColor(hex) {
    const rgb = hexToRgb(hex);
    return findClosestBeadColorFromRgb(rgb.r, rgb.g, rgb.b);
}

function rgbDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

export function ImportModal({
    isOpen,
    onClose,
    gridWidth,
    gridHeight,
    onImport
}) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [targetWidth, setTargetWidth] = useState(gridWidth);
    const [targetHeight, setTargetHeight] = useState(gridHeight);
    const [keepRatio, setKeepRatio] = useState(true);
    const [originalRatio, setOriginalRatio] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const [imageData, setImageData] = useState(null);
    const [maskData, setMaskData] = useState(null);
    const [tolerance, setTolerance] = useState(15); // 降低默认容差，避免误删主体
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const previewCanvasRef = useRef(null);
    const originalFile = useRef(null);
    const dragCounterRef = useRef(0);

    // 更新预览画布
    useEffect(() => {
        if (!isOpen || !imageData || !maskData || !previewCanvasRef.current) return;

        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = imageData.width;
        const height = imageData.height;

        canvas.width = width;
        canvas.height = height;

        const gridSize = 10;
        for (let y = 0; y < height; y += gridSize) {
            for (let x = 0; x < width; x += gridSize) {
                ctx.fillStyle = ((x / gridSize + y / gridSize) % 2 === 0) ? '#ccc' : '#fff';
                ctx.fillRect(x, y, gridSize, gridSize);
            }
        }

        const newImageData = ctx.createImageData(width, height);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const pixelIndex = i / 4;
            const maskValue = maskData[pixelIndex];

            if (maskValue > 0 && imageData.data[i + 3] > 128) {
                newImageData.data[i] = imageData.data[i];
                newImageData.data[i + 1] = imageData.data[i + 1];
                newImageData.data[i + 2] = imageData.data[i + 2];
                newImageData.data[i + 3] = 255;
            } else {
                newImageData.data[i + 3] = 0;
            }
        }

        ctx.putImageData(newImageData, 0, 0);
    }, [isOpen, imageData, maskData]);

    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        originalFile.current = selectedFile;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                setPreview(event.target.result);
                setOriginalRatio(img.width / img.height);

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, img.width, img.height);
                setImageData(data);

                const mask = new Uint8Array(img.width * img.height);
                mask.fill(255);
                setMaskData(mask);

                const maxSize = 80;
                if (img.width > img.height) {
                    setTargetWidth(maxSize);
                    setTargetHeight(Math.round(maxSize / (img.width / img.height)));
                } else {
                    setTargetHeight(maxSize);
                    setTargetWidth(Math.round(maxSize * (img.width / img.height)));
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(selectedFile);
    };

    // 处理拖拽文件
    const processFile = (fileToProcess) => {
        try {
            if (!fileToProcess) {
                console.error('没有文件');
                return;
            }

            if (!fileToProcess.type || !fileToProcess.type.startsWith('image/')) {
                alert('请拖入图片文件');
                return;
            }

            setFile(fileToProcess);
            originalFile.current = fileToProcess;

            const reader = new FileReader();
            reader.onerror = () => {
                console.error('文件读取失败');
                alert('文件读取失败，请重试');
            };
            reader.onload = (event) => {
                const img = new window.Image();
                img.onerror = () => {
                    console.error('图片加载失败');
                    alert('图片加载失败，请使用其他格式');
                };
                img.onload = () => {
                    try {
                        setPreview(event.target.result);
                        setOriginalRatio(img.width / img.height);

                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const data = ctx.getImageData(0, 0, img.width, img.height);
                        setImageData(data);

                        const mask = new Uint8Array(img.width * img.height);
                        mask.fill(255);
                        setMaskData(mask);

                        const maxSize = 80;
                        if (img.width > img.height) {
                            setTargetWidth(maxSize);
                            setTargetHeight(Math.round(maxSize / (img.width / img.height)));
                        } else {
                            setTargetHeight(maxSize);
                            setTargetWidth(Math.round(maxSize * (img.width / img.height)));
                        }
                    } catch (err) {
                        console.error('图片处理失败:', err);
                        alert('图片处理失败，请重试');
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(fileToProcess);
        } catch (error) {
            console.error('processFile 错误:', error);
            alert('处理文件时出错，请重试');
        }
    };

    // 拖拽事件处理
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounterRef.current--;
        if (dragCounterRef.current === 0) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounterRef.current = 0;

        try {
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const droppedFile = e.dataTransfer.files[0];
                processFile(droppedFile);
            }
        } catch (error) {
            console.error('拖拽处理失败:', error);
        }
    };

    // 边缘检测去背景
    const simpleRemoveBackground = () => {
        if (!imageData || !maskData) return;

        const width = imageData.width;
        const height = imageData.height;
        const newMask = new Uint8Array(maskData);
        const visited = new Set();
        const stack = [];

        const edgePixels = [];
        for (let x = 0; x < width; x++) {
            edgePixels.push({ x, y: 0 });
            edgePixels.push({ x, y: height - 1 });
        }
        for (let y = 0; y < height; y++) {
            edgePixels.push({ x: 0, y });
            edgePixels.push({ x: width - 1, y });
        }

        const colorCounts = {};
        edgePixels.forEach(({ x, y }) => {
            const i = (y * width + x) * 4;
            const key = `${Math.round(imageData.data[i] / 15) * 15},${Math.round(imageData.data[i + 1] / 15) * 15},${Math.round(imageData.data[i + 2] / 15) * 15}`;
            colorCounts[key] = (colorCounts[key] || 0) + 1;
        });

        let bgColorKey = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
        if (!bgColorKey) return;

        const [bgR, bgG, bgB] = bgColorKey.split(',').map(Number);

        edgePixels.forEach(edge => stack.push([edge.x, edge.y]));

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = cx + ',' + cy;
            if (visited.has(key) || cx < 0 || cx >= width || cy < 0 || cy >= height) continue;

            const pixelIndex = cy * width + cx;
            if (newMask[pixelIndex] === 0) continue;

            const i = pixelIndex * 4;
            const dist = rgbDistance(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], bgR, bgG, bgB);
            // 降低容差系数，更保守地去除背景
            if (dist > tolerance * 2.5) continue;

            visited.add(key);
            newMask[pixelIndex] = 0;
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }

        setMaskData(newMask);
    };

    const handleCanvasClick = (e) => {
        if (!isRemoveMode || !imageData || !maskData) return;

        const canvas = previewCanvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = imageData.width / rect.width;
        const scaleY = imageData.height / rect.height;
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);

        if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) return;

        const idx = (y * imageData.width + x) * 4;
        const targetR = imageData.data[idx];
        const targetG = imageData.data[idx + 1];
        const targetB = imageData.data[idx + 2];

        const newMask = new Uint8Array(maskData);
        const stack = [[x, y]];
        const visited = new Set();
        const width = imageData.width;
        const height = imageData.height;

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = cx + ',' + cy;
            if (visited.has(key) || cx < 0 || cx >= width || cy < 0 || cy >= height) continue;

            const pixelIndex = cy * width + cx;
            if (newMask[pixelIndex] === 0) continue;

            const i = pixelIndex * 4;
            const dist = rgbDistance(imageData.data[i], imageData.data[i + 1], imageData.data[i + 2], targetR, targetG, targetB);
            // 降低容差系数，手动模式更精确
            if (dist > tolerance * 2) continue;

            visited.add(key);
            newMask[pixelIndex] = 0;
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }

        setMaskData(newMask);
    };

    const resetMask = () => {
        if (!originalFile.current) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, img.width, img.height);
                setImageData(data);

                const mask = new Uint8Array(img.width * img.height);
                mask.fill(255);
                setMaskData(mask);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(originalFile.current);
    };

    const handleWidthChange = (value) => {
        const newWidth = parseInt(value) || 1;
        setTargetWidth(Math.min(128, Math.max(1, newWidth)));
        if (keepRatio) {
            setTargetHeight(Math.round(newWidth / originalRatio));
        }
    };

    const handleHeightChange = (value) => {
        const newHeight = parseInt(value) || 1;
        setTargetHeight(Math.min(128, Math.max(1, newHeight)));
        if (keepRatio) {
            setTargetWidth(Math.round(newHeight * originalRatio));
        }
    };

    const handleImport = async () => {
        if (!imageData || !maskData) return;

        setIsProcessing(true);

        try {
            // 创建带遮罩的源图像
            const maskedCanvas = document.createElement('canvas');
            maskedCanvas.width = imageData.width;
            maskedCanvas.height = imageData.height;
            const maskedCtx = maskedCanvas.getContext('2d');
            const maskedImageData = maskedCtx.createImageData(imageData.width, imageData.height);

            for (let i = 0; i < imageData.data.length; i += 4) {
                const pixelIndex = i / 4;
                if (maskData[pixelIndex] > 0) {
                    maskedImageData.data[i] = imageData.data[i];
                    maskedImageData.data[i + 1] = imageData.data[i + 1];
                    maskedImageData.data[i + 2] = imageData.data[i + 2];
                    maskedImageData.data[i + 3] = imageData.data[i + 3];
                } else {
                    maskedImageData.data[i + 3] = 0;
                }
            }
            maskedCtx.putImageData(maskedImageData, 0, 0);

            // 高质量多步缩放（逐步减半，减少失真）
            let currentCanvas = maskedCanvas;
            let currentWidth = imageData.width;
            let currentHeight = imageData.height;

            // 当源尺寸大于目标尺寸的2倍时，逐步缩小
            while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
                const newWidth = Math.max(targetWidth, Math.floor(currentWidth / 2));
                const newHeight = Math.max(targetHeight, Math.floor(currentHeight / 2));

                const stepCanvas = document.createElement('canvas');
                stepCanvas.width = newWidth;
                stepCanvas.height = newHeight;
                const stepCtx = stepCanvas.getContext('2d');
                stepCtx.imageSmoothingEnabled = true;
                stepCtx.imageSmoothingQuality = 'high';
                stepCtx.drawImage(currentCanvas, 0, 0, newWidth, newHeight);

                currentCanvas = stepCanvas;
                currentWidth = newWidth;
                currentHeight = newHeight;
            }

            // 最终缩放到目标尺寸
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(currentCanvas, 0, 0, targetWidth, targetHeight);

            const finalData = ctx.getImageData(0, 0, targetWidth, targetHeight).data;

            const pixels = {};

            for (let y = 0; y < targetHeight; y++) {
                for (let x = 0; x < targetWidth; x++) {
                    const i = (y * targetWidth + x) * 4;
                    const r = finalData[i];
                    const g = finalData[i + 1];
                    const b = finalData[i + 2];
                    const a = finalData[i + 3];

                    if (a < 128) continue;

                    const beadColor = findClosestBeadColorFromRgb(r, g, b);

                    pixels[x + ',' + y] = {
                        colorId: beadColor.id,
                        hex: beadColor.hex
                    };
                }
            }

            onImport(pixels, targetWidth, targetHeight);
            handleClose();
        } catch (error) {
            console.error('导入失败:', error);
            alert('图片导入失败: ' + error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreview(null);
        setImageData(null);
        setMaskData(null);
        setIsRemoveMode(false);
        originalFile.current = null;
        onClose();
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setImageData(null);
        setMaskData(null);
        setIsRemoveMode(false);
        originalFile.current = null;
    };

    const remainingPixels = maskData ? maskData.filter(v => v > 0).length : 0;
    const totalPixels = imageData ? imageData.width * imageData.height : 0;
    const removedPercent = totalPixels > 0 ? Math.round((1 - remainingPixels / totalPixels) * 100) : 0;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="import-modal glass" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>导入图片</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {!preview ? (
                        <label
                            className={`upload-area ${isDragging ? 'dragging' : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                hidden
                            />
                            <Upload size={48} className="upload-icon" />
                            <span className="upload-text">
                                {isDragging ? '松开鼠标放置图片' : '点击或拖拽图片到此处'}
                            </span>
                            <span className="upload-hint">支持 PNG (透明背景), JPG, GIF</span>
                        </label>
                    ) : (
                        <>
                            <div className="preview-section">
                                <div className="preview-container">
                                    <canvas
                                        ref={previewCanvasRef}
                                        className={`preview-canvas ${isRemoveMode ? 'remove-mode' : ''}`}
                                        onClick={handleCanvasClick}
                                        style={{
                                            maxWidth: '100%',
                                            maxHeight: '200px',
                                            cursor: isRemoveMode ? 'crosshair' : 'default'
                                        }}
                                    />
                                </div>

                                <div className="remove-tools">
                                    <button
                                        className="tool-btn primary"
                                        onClick={simpleRemoveBackground}
                                        title="智能去背景（边缘检测）"
                                    >
                                        <Wand2 size={16} />
                                        <span>去背景</span>
                                    </button>

                                    <button
                                        className={`tool-btn ${isRemoveMode ? 'active' : ''}`}
                                        onClick={() => setIsRemoveMode(!isRemoveMode)}
                                        title="手动点击移除"
                                    >
                                        <span>手动</span>
                                    </button>

                                    <button className="tool-btn" onClick={resetMask} title="重置">
                                        <RotateCcw size={16} />
                                    </button>
                                </div>

                                {isRemoveMode && (
                                    <div className="tolerance-section">
                                        <div className="tolerance-control">
                                            <label>容差:</label>
                                            <input
                                                type="range"
                                                min="5"
                                                max="80"
                                                value={tolerance}
                                                onChange={(e) => setTolerance(parseInt(e.target.value))}
                                            />
                                            <span>{tolerance}</span>
                                        </div>
                                        <div className="remove-hint">
                                            💡 点击图片中要移除的区域
                                        </div>
                                    </div>
                                )}

                                {removedPercent > 0 && (
                                    <div className="remove-stats">
                                        已移除 {removedPercent}% 的背景
                                    </div>
                                )}
                            </div>

                            <div className="size-controls">
                                <div className="size-presets">
                                    <span className="preset-label">快捷尺寸:</span>
                                    {[20, 30, 40, 60, 80].map(size => (
                                        <button
                                            key={size}
                                            className={`preset-btn ${targetWidth === size || targetHeight === size ? 'active' : ''}`}
                                            onClick={() => {
                                                if (originalRatio >= 1) {
                                                    setTargetWidth(size);
                                                    setTargetHeight(Math.round(size / originalRatio));
                                                } else {
                                                    setTargetHeight(size);
                                                    setTargetWidth(Math.round(size * originalRatio));
                                                }
                                            }}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                <div className="size-inputs-row">
                                    <div className="size-input">
                                        <label>宽度</label>
                                        <input
                                            type="number"
                                            value={targetWidth}
                                            onChange={(e) => handleWidthChange(e.target.value)}
                                            min="1"
                                            max="128"
                                        />
                                    </div>
                                    <div className="size-input">
                                        <label>高度</label>
                                        <input
                                            type="number"
                                            value={targetHeight}
                                            onChange={(e) => handleHeightChange(e.target.value)}
                                            min="1"
                                            max="128"
                                        />
                                    </div>
                                    <label className="ratio-toggle">
                                        <input
                                            type="checkbox"
                                            checked={keepRatio}
                                            onChange={(e) => setKeepRatio(e.target.checked)}
                                        />
                                        <span>保持比例</span>
                                    </label>
                                </div>
                            </div>

                            <div className="info-text">
                                {(() => {
                                    const totalBeads = targetWidth * targetHeight;
                                    const keepRatio = remainingPixels / totalPixels;
                                    const actualBeads = totalPixels > 0 ? Math.round(totalBeads * keepRatio) : totalBeads;
                                    return removedPercent > 0
                                        ? `将生成约 ${actualBeads} 个拼豆（${targetWidth}×${targetHeight}，已去除${removedPercent}%背景）`
                                        : `将生成 ${totalBeads} 个拼豆（${targetWidth}×${targetHeight}）`;
                                })()}
                            </div>

                            <button className="change-file-btn" onClick={handleReset}>
                                <Image size={16} />
                                更换图片
                            </button>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="cancel-btn" onClick={handleClose}>取消</button>
                    <button
                        className="confirm-btn"
                        onClick={handleImport}
                        disabled={!imageData || isProcessing}
                    >
                        {isProcessing ? '处理中...' : '确认导入'}
                        {!isProcessing && <Check size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, Image, Wand2, RotateCcw, Sparkles, Loader2, Settings } from 'lucide-react';
import { BEAD_COLORS } from '../data/beadColors';
import './ImportModal.css';

// 动态导入去背景库
let removeBackground = null;

async function loadRemoveBackground() {
    if (!removeBackground) {
        const module = await import('@imgly/background-removal');
        removeBackground = module.removeBackground;
    }
    return removeBackground;
}

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

function colorDistance(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
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

function findClosestBeadColor(hex) {
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

function rgbDistance(r1, g1, b1, r2, g2, b2) {
    return Math.sqrt(
        Math.pow(r1 - r2, 2) +
        Math.pow(g1 - g2, 2) +
        Math.pow(b1 - b2, 2)
    );
}

// 从 localStorage 获取 API Key
function getRemoveBgApiKey() {
    return localStorage.getItem('removebg_api_key') || '';
}

function setRemoveBgApiKey(key) {
    localStorage.setItem('removebg_api_key', key);
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
    const [tolerance, setTolerance] = useState(30);
    const [isRemoveMode, setIsRemoveMode] = useState(false);
    const [isAIProcessing, setIsAIProcessing] = useState(false);
    const [aiProgress, setAiProgress] = useState('');
    const [showApiSettings, setShowApiSettings] = useState(false);
    const [apiKey, setApiKey] = useState(getRemoveBgApiKey());
    const previewCanvasRef = useRef(null);
    const originalFile = useRef(null);

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

    // 使用 Remove.bg API（效果最好）
    const removeBgApi = async () => {
        if (!originalFile.current || !apiKey) {
            setShowApiSettings(true);
            return;
        }

        setIsAIProcessing(true);
        setAiProgress('正在调用 Remove.bg API...');

        try {
            const formData = new FormData();
            formData.append('image_file', originalFile.current);
            formData.append('size', 'auto');

            const response = await fetch('https://api.remove.bg/v1.0/removebg', {
                method: 'POST',
                headers: {
                    'X-Api-Key': apiKey
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.errors?.[0]?.title || 'API 请求失败');
            }

            const blob = await response.blob();
            applyResultBlob(blob);

        } catch (error) {
            console.error('Remove.bg API 失败:', error);
            setAiProgress('');
            setIsAIProcessing(false);
            alert('Remove.bg API 失败: ' + error.message + '\n请检查 API Key 是否正确');
        }
    };

    // 本地 AI 去背景（优化参数）
    const aiRemoveBackground = async () => {
        if (!originalFile.current) return;

        setIsAIProcessing(true);
        setAiProgress('正在加载 AI 模型...');

        try {
            const removeBg = await loadRemoveBackground();

            setAiProgress('AI 正在分析图片...');

            const blob = await removeBg(originalFile.current, {
                model: 'medium', // 使用中等模型，平衡速度和质量
                output: {
                    format: 'image/png',
                    quality: 1 // 最高质量
                },
                progress: (key, current, total) => {
                    if (key === 'compute:inference') {
                        setAiProgress(`AI 处理中... ${Math.round((current / total) * 100)}%`);
                    } else if (key === 'fetch:model') {
                        setAiProgress(`下载模型... ${Math.round((current / total) * 100)}%`);
                    }
                }
            });

            applyResultBlob(blob);

        } catch (error) {
            console.error('本地 AI 去背景失败:', error);
            setAiProgress('');
            setIsAIProcessing(false);
            alert('AI 去背景失败，请尝试其他方法');
        }
    };

    // 应用去背景结果
    const applyResultBlob = (blob) => {
        setAiProgress('正在应用结果...');

        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const newData = ctx.getImageData(0, 0, img.width, img.height);

            setImageData(newData);

            const newMask = new Uint8Array(img.width * img.height);
            for (let i = 0; i < newData.data.length; i += 4) {
                newMask[i / 4] = newData.data[i + 3] > 128 ? 255 : 0;
            }
            setMaskData(newMask);

            setAiProgress('');
            setIsAIProcessing(false);

            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(blob);
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
            if (dist > tolerance * 3.5) continue;

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
            if (dist > tolerance * 2.5) continue;

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
            const tempCanvas = document.createElement('canvas');
            const ctx = tempCanvas.getContext('2d');
            tempCanvas.width = targetWidth;
            tempCanvas.height = targetHeight;

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

            ctx.drawImage(maskedCanvas, 0, 0, targetWidth, targetHeight);

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

                    const hex = rgbToHex(r, g, b);
                    const beadColor = findClosestBeadColor(hex);

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
        setIsAIProcessing(false);
        setAiProgress('');
        setShowApiSettings(false);
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

    const saveApiKey = () => {
        setRemoveBgApiKey(apiKey);
        setShowApiSettings(false);
        if (apiKey) {
            removeBgApi();
        }
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
                        <label className="upload-area">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                hidden
                            />
                            <Upload size={48} className="upload-icon" />
                            <span className="upload-text">点击或拖拽图片到此处</span>
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
                                    {isAIProcessing && (
                                        <div className="ai-loading-overlay">
                                            <Loader2 size={32} className="spin" />
                                            <span>{aiProgress}</span>
                                        </div>
                                    )}
                                </div>

                                {showApiSettings ? (
                                    <div className="api-settings">
                                        <div className="api-settings-header">
                                            <span>Remove.bg API Key</span>
                                            <a href="https://www.remove.bg/api" target="_blank" rel="noopener noreferrer">
                                                获取免费 Key
                                            </a>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="输入你的 API Key..."
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="api-key-input"
                                        />
                                        <div className="api-settings-actions">
                                            <button className="tool-btn" onClick={() => setShowApiSettings(false)}>取消</button>
                                            <button className="tool-btn primary" onClick={saveApiKey}>保存并使用</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="remove-tools">
                                        <button
                                            className="tool-btn api-btn"
                                            onClick={removeBgApi}
                                            disabled={isAIProcessing}
                                            title="使用 Remove.bg API（效果最好）"
                                        >
                                            <Sparkles size={16} />
                                            <span>Remove.bg</span>
                                        </button>

                                        <button
                                            className="tool-btn ai-btn"
                                            onClick={aiRemoveBackground}
                                            disabled={isAIProcessing}
                                            title="本地 AI（无需网络）"
                                        >
                                            <Sparkles size={16} />
                                            <span>本地AI</span>
                                        </button>

                                        <button
                                            className="tool-btn"
                                            onClick={simpleRemoveBackground}
                                            title="快速去背景"
                                        >
                                            <Wand2 size={16} />
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

                                        <button
                                            className="tool-btn settings-btn"
                                            onClick={() => setShowApiSettings(true)}
                                            title="API 设置"
                                        >
                                            <Settings size={16} />
                                        </button>
                                    </div>
                                )}

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

                            <div className="info-text">
                                将生成 {targetWidth} × {targetHeight} = {targetWidth * targetHeight} 个拼豆（透明区域除外）
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
                        disabled={!imageData || isProcessing || isAIProcessing}
                    >
                        {isProcessing ? '处理中...' : '确认导入'}
                        {!isProcessing && <Check size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useCanvas, TOOLS } from './hooks/useCanvas';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { ColorPalette } from './components/ColorPalette';
import { Header } from './components/Header';
import { ImportModal } from './components/ImportModal';
import { BeadStats } from './components/BeadStats';
import './App.css';

// 颜色工具函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 };
}

function App() {
    const canvas = useCanvas();
    const containerRef = useRef(null);
    const [showImportModal, setShowImportModal] = useState(false);

    // 计算颜色编号映射 (colorId -> number)
    const colorNumberMap = useMemo(() => {
        const uniqueColorIds = new Set();
        Object.values(canvas.pixels).forEach(p => {
            if (p.colorId) uniqueColorIds.add(p.colorId);
        });

        const map = {};
        // 排序以确保编号稳定，例如按字母顺序
        Array.from(uniqueColorIds).sort().forEach((id, index) => {
            map[id] = index + 1;
        });
        return map;
    }, [canvas.pixels]);

    // 居中画布和响应窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { clientWidth, clientHeight } = containerRef.current;
                canvas.centerCanvas(clientWidth, clientHeight);
            }
        };

        // 初始居中
        handleResize();

        // 防止频繁触发重绘
        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, [canvas.centerCanvas]);

    // 键盘快捷键
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                canvas.undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                canvas.redo();
            } else if (e.key === 'b') {
                canvas.setCurrentTool(TOOLS.PEN);
            } else if (e.key === 'e') {
                canvas.setCurrentTool(TOOLS.ERASER);
            } else if (e.key === 'g') {
                canvas.setCurrentTool(TOOLS.FILL);
            } else if (e.key === 'i') {
                canvas.setCurrentTool(TOOLS.PICKER);
            } else if (e.key === ' ') {
                canvas.setCurrentTool(TOOLS.PAN);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvas]);

    // 导出图片
    const handleExportImage = useCallback((format) => {
        if (format === 'png') {
            const exportCanvas = document.createElement('canvas');
            const size = 20;
            exportCanvas.width = canvas.gridWidth * size;
            exportCanvas.height = canvas.gridHeight * size;
            const ctx = exportCanvas.getContext('2d');

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

            Object.entries(canvas.pixels).forEach(([key, pixel]) => {
                const [x, y] = key.split(',').map(Number);
                ctx.fillStyle = pixel.hex;
                // 正方形拼豆
                ctx.fillRect(x * size + 1, y * size + 1, size - 2, size - 2);

                // 如果开启了显示编号，导出时也显示
                if (canvas.showNumbers && pixel.colorId && colorNumberMap[pixel.colorId]) {
                    const rgb = pixel.hex ? hexToRgb(pixel.hex) : { r: 128, g: 128, b: 128 };
                    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                    ctx.fillStyle = brightness > 128 ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)';

                    const fontSize = 10;
                    ctx.font = `bold ${fontSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    const label = colorNumberMap[pixel.colorId].toString();
                    ctx.fillText(label, x * size + size / 2, y * size + size / 2);
                }
            });

            const link = document.createElement('a');
            link.download = 'pindou-art-' + Date.now() + '.png';
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
        } else if (format === 'json') {
            const data = {
                width: canvas.gridWidth,
                height: canvas.gridHeight,
                pixels: canvas.pixels
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.download = 'pindou-art-' + Date.now() + '.json';
            link.href = URL.createObjectURL(blob);
            link.click();
        }
    }, [canvas.gridWidth, canvas.gridHeight, canvas.pixels, canvas.showNumbers, colorNumberMap]);

    // 导入图片
    const handleImport = useCallback((pixels, width, height) => {
        canvas.resizeGrid(width, height);
        canvas.setPixels(pixels);
        canvas.saveHistory();

        // 重新居中
        if (containerRef.current) {
            setTimeout(() => {
                const { clientWidth, clientHeight } = containerRef.current;
                canvas.centerCanvas(clientWidth, clientHeight);
            }, 100);
        }
    }, [canvas]);

    return (
        <div className="app" ref={containerRef}>
            <Header
                gridWidth={canvas.gridWidth}
                gridHeight={canvas.gridHeight}
                pixels={canvas.pixels}
                onExportImage={handleExportImage}
                onOpenSettings={() => { }}
                onOpenImport={() => setShowImportModal(true)}
            />

            <div className="main-content">
                <Toolbar
                    currentTool={canvas.currentTool}
                    onToolChange={canvas.setCurrentTool}
                    showGrid={canvas.showGrid}
                    onToggleGrid={() => canvas.setShowGrid(!canvas.showGrid)}
                    showNumbers={canvas.showNumbers}
                    onToggleNumbers={() => canvas.setShowNumbers(!canvas.showNumbers)}
                    canUndo={canvas.canUndo}
                    canRedo={canvas.canRedo}
                    onUndo={canvas.undo}
                    onRedo={canvas.redo}
                    onClear={canvas.clearCanvas}
                    onZoomIn={() => canvas.zoom(4, window.innerWidth / 2, window.innerHeight / 2)}
                    onZoomOut={() => canvas.zoom(-4, window.innerWidth / 2, window.innerHeight / 2)}
                    TOOLS={TOOLS}
                />

                <div className="canvas-area" ref={containerRef}>
                    <Canvas
                        gridWidth={canvas.gridWidth}
                        gridHeight={canvas.gridHeight}
                        pixels={canvas.pixels}
                        cellSize={canvas.cellSize}
                        offset={canvas.offset}
                        showGrid={canvas.showGrid}
                        showNumbers={canvas.showNumbers}
                        currentTool={canvas.currentTool}
                        onCanvasClick={canvas.handleCanvasClick}
                        onZoom={canvas.zoom}
                        onPan={canvas.pan}
                        onSaveHistory={canvas.saveHistory}
                        onDeleteRect={canvas.deleteRect}
                        isPanning={canvas.isPanning}
                        lastPanPoint={canvas.lastPanPoint}
                        isDrawing={canvas.isDrawing}
                        TOOLS={TOOLS}
                        colorNumberMap={colorNumberMap}
                    />
                </div>

                <div className="sidebar-right glass">
                    <ColorPalette
                        currentColor={canvas.currentColor}
                        onColorChange={canvas.setCurrentColor}
                    />
                    <div className="sidebar-divider"></div>
                    <BeadStats
                        pixels={canvas.pixels}
                        colorNumberMap={colorNumberMap}
                    />

                    <footer className="app-footer sidebar-footer">
                        © 2026 Pindou.Doki
                    </footer>
                </div>
            </div>

            <ImportModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                gridWidth={canvas.gridWidth}
                gridHeight={canvas.gridHeight}
                onImport={handleImport}
            />
        </div>
    );
}

export default App;

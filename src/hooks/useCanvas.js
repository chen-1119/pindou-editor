import { useState, useCallback, useRef, useEffect } from 'react';

const TOOLS = {
    PEN: 'pen',
    ERASER: 'eraser',
    FILL: 'fill',
    PICKER: 'picker',
    PAN: 'pan',
    MAGIC_ERASER: 'magic_eraser',
    RECT_SELECT: 'rect_select'
};

const DEFAULT_GRID_SIZE = 32;
const MIN_CELL_SIZE = 4;
const MAX_CELL_SIZE = 60;
const DEFAULT_CELL_SIZE = 20;

export function useCanvas() {
    // 网格数据
    const [gridWidth, setGridWidth] = useState(DEFAULT_GRID_SIZE);
    const [gridHeight, setGridHeight] = useState(DEFAULT_GRID_SIZE);
    const [pixels, setPixels] = useState({});

    // 视图状态
    const [cellSize, setCellSize] = useState(DEFAULT_CELL_SIZE);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    // 工具状态
    const [currentTool, setCurrentTool] = useState(TOOLS.PEN);
    const [currentColor, setCurrentColor] = useState({ id: 'blue', hex: '#3B82F6' });
    const [showGrid, setShowGrid] = useState(true);
    const [showNumbers, setShowNumbers] = useState(false);

    // 历史记录
    const [history, setHistory] = useState([{}]);
    const [historyIndex, setHistoryIndex] = useState(0);

    // 拖拽状态
    const isPanning = useRef(false);
    const lastPanPoint = useRef({ x: 0, y: 0 });
    const isDrawing = useRef(false);

    // 设置像素
    const setPixel = useCallback((x, y, colorId, colorHex) => {
        if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return;

        setPixels(prev => {
            const key = `${x},${y}`;
            const newPixels = { ...prev };

            if (colorId === null) {
                delete newPixels[key];
            } else {
                newPixels[key] = { colorId, hex: colorHex };
            }

            return newPixels;
        });
    }, [gridWidth, gridHeight]);

    // 获取像素
    const getPixel = useCallback((x, y) => {
        return pixels[`${x},${y}`] || null;
    }, [pixels]);

    // 填充算法 (洪水填充)
    const floodFill = useCallback((startX, startY, targetColorId, fillColorId, fillHex) => {
        if (targetColorId === fillColorId) return;

        const stack = [[startX, startY]];
        const visited = new Set();
        const newPixels = { ...pixels };

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) continue;

            const currentPixel = newPixels[key];
            const currentColorId = currentPixel?.colorId || null;

            if (currentColorId !== targetColorId) continue;

            visited.add(key);
            newPixels[key] = { colorId: fillColorId, hex: fillHex };

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        setPixels(newPixels);
    }, [pixels, gridWidth, gridHeight]);

    // 魔术橡皮擦 - 删除相同颜色的连续区域
    const magicErase = useCallback((startX, startY) => {
        const targetPixel = pixels[`${startX},${startY}`];
        if (!targetPixel) return;

        const targetColorId = targetPixel.colorId;
        const stack = [[startX, startY]];
        const visited = new Set();
        const newPixels = { ...pixels };

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;

            if (visited.has(key)) continue;
            if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) continue;

            const currentPixel = newPixels[key];
            if (!currentPixel || currentPixel.colorId !== targetColorId) continue;

            visited.add(key);
            delete newPixels[key];

            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }

        setPixels(newPixels);
    }, [pixels, gridWidth, gridHeight]);

    // 处理画布点击
    const handleCanvasClick = useCallback((canvasX, canvasY) => {
        const gridX = Math.floor((canvasX - offset.x) / cellSize);
        const gridY = Math.floor((canvasY - offset.y) / cellSize);

        if (gridX < 0 || gridX >= gridWidth || gridY < 0 || gridY >= gridHeight) {
            return;
        }

        switch (currentTool) {
            case TOOLS.PEN:
                setPixel(gridX, gridY, currentColor.id, currentColor.hex);
                break;
            case TOOLS.ERASER:
                setPixel(gridX, gridY, null, null);
                break;
            case TOOLS.FILL:
                const targetPixel = getPixel(gridX, gridY);
                floodFill(gridX, gridY, targetPixel?.colorId || null, currentColor.id, currentColor.hex);
                break;
            case TOOLS.PICKER:
                const pickedPixel = getPixel(gridX, gridY);
                if (pickedPixel) {
                    setCurrentColor({ id: pickedPixel.colorId, hex: pickedPixel.hex });
                }
                break;
            case TOOLS.MAGIC_ERASER:
                magicErase(gridX, gridY);
                break;
            default:
                break;
        }
    }, [offset, cellSize, currentTool, currentColor, gridWidth, gridHeight, setPixel, getPixel, floodFill, magicErase]);

    // 缩放
    const zoom = useCallback((delta, centerX, centerY) => {
        setCellSize(prev => {
            const newSize = Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, prev + delta));

            // 以鼠标位置为中心缩放
            const scale = newSize / prev;
            setOffset(o => ({
                x: centerX - (centerX - o.x) * scale,
                y: centerY - (centerY - o.y) * scale
            }));

            return newSize;
        });
    }, []);

    // 平移
    const pan = useCallback((dx, dy) => {
        setOffset(prev => ({
            x: prev.x + dx,
            y: prev.y + dy
        }));
    }, []);

    // 撤销
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setPixels(history[historyIndex - 1]);
        }
    }, [history, historyIndex]);

    // 重做
    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setPixels(history[historyIndex + 1]);
        }
    }, [history, historyIndex]);

    // 保存历史
    const saveHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), { ...pixels }]);
        setHistoryIndex(prev => prev + 1);
    }, [pixels, historyIndex]);

    // 清空画布
    const clearCanvas = useCallback(() => {
        saveHistory();
        setPixels({});
    }, [saveHistory]);

    // 调整网格大小
    const resizeGrid = useCallback((width, height) => {
        setGridWidth(width);
        setGridHeight(height);
    }, []);

    // 居中画布
    // 居中并自适应缩放画布
    const centerCanvas = useCallback((containerWidth, containerHeight) => {
        const padding = 40; // 留白
        const availableWidth = containerWidth - padding * 2;
        const availableHeight = containerHeight - padding * 2;

        // 计算最佳单元格大小
        const optimalCellSizeW = availableWidth / gridWidth;
        const optimalCellSizeH = availableHeight / gridHeight;

        // 取较小值以确保完全可见，并限制最大/最小值
        let newCellSize = Math.min(optimalCellSizeW, optimalCellSizeH);
        newCellSize = Math.max(5, Math.min(newCellSize, 40)); // 限制范围 [5, 40]

        setCellSize(newCellSize);

        const totalWidth = gridWidth * newCellSize;
        const totalHeight = gridHeight * newCellSize;

        setOffset({
            x: (containerWidth - totalWidth) / 2,
            y: (containerHeight - totalHeight) / 2
        });
    }, [gridWidth, gridHeight]);

    // 选区状态
    const selection = useRef(null);

    // 设置选区
    const setSelection = useCallback((sel) => {
        selection.current = sel;
    }, []);

    // 删除矩形区域内的拼豆
    const deleteRect = useCallback((x1, y1, x2, y2) => {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        setPixels(prev => {
            const newPixels = { ...prev };
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    const key = `${x},${y}`;
                    delete newPixels[key];
                }
            }
            return newPixels;
        });
    }, []);

    return {
        // 状态
        gridWidth,
        gridHeight,
        pixels,
        cellSize,
        offset,
        currentTool,
        currentColor,
        showGrid,
        showNumbers,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,

        // 设置器
        setCurrentTool,
        setCurrentColor,
        setShowGrid,
        setShowNumbers,
        setCellSize,
        setPixels,

        // 操作
        handleCanvasClick,
        zoom,
        pan,
        undo,
        redo,
        saveHistory,
        clearCanvas,
        resizeGrid,
        centerCanvas,
        setPixel,
        getPixel,
        deleteRect,
        setSelection,

        // Refs
        isPanning,
        lastPanPoint,
        isDrawing,
        selection,

        // 常量
        TOOLS
    };
}

export { TOOLS };

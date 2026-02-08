import React, { useRef, useEffect, useCallback, useState } from 'react';
import './Canvas.css';

// 颜色工具函数
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 128, g: 128, b: 128 };
}

export function Canvas({
  gridWidth,
  gridHeight,
  pixels,
  cellSize,
  offset,
  showGrid,
  showNumbers,
  currentTool,
  onCanvasClick,
  onZoom,
  onPan,
  onSaveHistory,
  onDeleteRect,
  isPanning,
  lastPanPoint,
  isDrawing,
  TOOLS,
  colorNumberMap
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [selection, setSelection] = useState(null);
  const selectionStart = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // 清空画布，显示 CSS 背景
    ctx.clearRect(0, 0, width, height);

    const startX = Math.max(0, Math.floor(-offset.x / cellSize));
    const startY = Math.max(0, Math.floor(-offset.y / cellSize));
    const endX = Math.min(gridWidth, Math.ceil((width - offset.x) / cellSize));
    const endY = Math.min(gridHeight, Math.ceil((height - offset.y) / cellSize));

    // 绘制网格背景 (可选，改为浅色或者直接透明)
    // 如果需要每个格子有背景色，可以在这里绘制
    /*
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const px = offset.x + x * cellSize;
        const py = offset.y + y * cellSize;
        ctx.fillRect(px + 0.5, py + 0.5, cellSize - 1, cellSize - 1);
      }
    }
    */

    // 绘制拼豆
    Object.entries(pixels).forEach(function (entry) {
      const key = entry[0];
      const pixel = entry[1];
      const coords = key.split(',');
      const x = parseInt(coords[0], 10);
      const y = parseInt(coords[1], 10);

      if (x >= startX && x < endX && y >= startY && y < endY) {
        const px = offset.x + x * cellSize;
        const py = offset.y + y * cellSize;
        const gap = 1;

        ctx.fillStyle = pixel.hex;
        ctx.fillRect(px + gap, py + gap, cellSize - gap * 2, cellSize - gap * 2);

        if (cellSize >= 10) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(px + gap, py + gap, cellSize - gap * 2, 2);
          ctx.fillRect(px + gap, py + gap, 2, cellSize - gap * 2);

          ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
          ctx.fillRect(px + gap, py + cellSize - gap - 2, cellSize - gap * 2, 2);
          ctx.fillRect(px + cellSize - gap - 2, py + gap, 2, cellSize - gap * 2);
        }

        // 显示编号
        if (showNumbers && cellSize >= 8 && pixel.colorId && colorNumberMap && colorNumberMap[pixel.colorId]) {
          const rgb = pixel.hex ? hexToRgb(pixel.hex) : { r: 128, g: 128, b: 128 };
          const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
          ctx.fillStyle = brightness > 128 ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,1)';

          // 动态字体大小，确保在小格子里也能勉强看清
          const fontSize = Math.max(6, Math.min(cellSize * 0.6, 16));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const label = colorNumberMap[pixel.colorId].toString();
          ctx.fillText(label, px + cellSize / 2, py + cellSize / 2 + 1); // +1 微调垂直居中
        }
      }
    });

    // 绘制网格线
    if (showGrid && cellSize >= 8) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = startX; x <= endX; x++) {
        const px = offset.x + x * cellSize;
        ctx.moveTo(px, Math.max(0, offset.y));
        ctx.lineTo(px, Math.min(height, offset.y + gridHeight * cellSize));
      }
      for (let y = startY; y <= endY; y++) {
        const py = offset.y + y * cellSize;
        ctx.moveTo(Math.max(0, offset.x), py);
        ctx.lineTo(Math.min(width, offset.x + gridWidth * cellSize), py);
      }
      ctx.stroke();
    }

    // 绘制边框
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(offset.x, offset.y, gridWidth * cellSize, gridHeight * cellSize);

    // 绘制选区
    if (selection) {
      const x1 = offset.x + selection.x1 * cellSize;
      const y1 = offset.y + selection.y1 * cellSize;
      const x2 = offset.x + (selection.x2 + 1) * cellSize;
      const y2 = offset.y + (selection.y2 + 1) * cellSize;

      ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);

      ctx.strokeStyle = '#ff6464';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [gridWidth, gridHeight, pixels, cellSize, offset, showGrid, showNumbers, selection, colorNumberMap]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCanvasCoords = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const getGridCoords = useCallback((canvasX, canvasY) => {
    return {
      x: Math.floor((canvasX - offset.x) / cellSize),
      y: Math.floor((canvasY - offset.y) / cellSize)
    };
  }, [offset, cellSize]);

  const handleMouseDown = useCallback((e) => {
    const coords = getCanvasCoords(e);

    if (e.button === 1 || (e.button === 0 && currentTool === TOOLS.PAN) || e.shiftKey) {
      isPanning.current = true;
      lastPanPoint.current = coords;
      return;
    }

    if (e.button === 0) {
      if (currentTool === TOOLS.RECT_SELECT) {
        const gridCoords = getGridCoords(coords.x, coords.y);
        selectionStart.current = gridCoords;
        setSelection({
          x1: gridCoords.x,
          y1: gridCoords.y,
          x2: gridCoords.x,
          y2: gridCoords.y
        });
      } else {
        isDrawing.current = true;
        onCanvasClick(coords.x, coords.y);
      }
    }
  }, [getCanvasCoords, getGridCoords, currentTool, onCanvasClick, isPanning, lastPanPoint, isDrawing, TOOLS]);

  const handleMouseMove = useCallback((e) => {
    const coords = getCanvasCoords(e);

    if (isPanning.current) {
      const dx = coords.x - lastPanPoint.current.x;
      const dy = coords.y - lastPanPoint.current.y;
      onPan(dx, dy);
      lastPanPoint.current = coords;
      return;
    }

    if (currentTool === TOOLS.RECT_SELECT && selectionStart.current) {
      const gridCoords = getGridCoords(coords.x, coords.y);
      setSelection({
        x1: Math.min(selectionStart.current.x, gridCoords.x),
        y1: Math.min(selectionStart.current.y, gridCoords.y),
        x2: Math.max(selectionStart.current.x, gridCoords.x),
        y2: Math.max(selectionStart.current.y, gridCoords.y)
      });
      return;
    }

    if (isDrawing.current && (currentTool === TOOLS.PEN || currentTool === TOOLS.ERASER)) {
      onCanvasClick(coords.x, coords.y);
    }
  }, [getCanvasCoords, getGridCoords, currentTool, onCanvasClick, onPan, isPanning, lastPanPoint, isDrawing, TOOLS]);

  const handleMouseUp = useCallback(() => {
    if (currentTool === TOOLS.RECT_SELECT && selection && selectionStart.current) {
      // 删除选区内的拼豆
      if (onDeleteRect) {
        onSaveHistory();
        onDeleteRect(selection.x1, selection.y1, selection.x2, selection.y2);
      }
      selectionStart.current = null;
      setSelection(null);
    } else if (isDrawing.current) {
      onSaveHistory();
    }

    isPanning.current = false;
    isDrawing.current = false;
  }, [currentTool, selection, onDeleteRect, onSaveHistory, isPanning, isDrawing, TOOLS]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const delta = e.deltaY > 0 ? -2 : 2;
    onZoom(delta, coords.x, coords.y);
  }, [getCanvasCoords, onZoom]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="pixel-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
        style={{ cursor: currentTool === TOOLS.RECT_SELECT ? 'crosshair' : 'default' }}
      />
    </div>
  );
}

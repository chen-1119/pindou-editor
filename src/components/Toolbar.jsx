import React from 'react';
import {
    Pencil,
    Eraser,
    PaintBucket,
    Pipette,
    Move,
    Grid,
    Undo2,
    Redo2,
    Trash2,
    ZoomIn,
    ZoomOut,
    Wand2,
    BoxSelect,
    Hash
} from 'lucide-react';
import './Toolbar.css';

export function Toolbar({
    currentTool,
    onToolChange,
    showGrid,
    onToggleGrid,
    showNumbers,
    onToggleNumbers,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onClear,
    onZoomIn,
    onZoomOut,
    TOOLS
}) {
    const tools = [
        { id: TOOLS.PEN, icon: Pencil, label: '画笔 (B)' },
        { id: TOOLS.ERASER, icon: Eraser, label: '橡皮擦 (E)' },
        { id: TOOLS.RECT_SELECT, icon: BoxSelect, label: '框选删除 - 拖动框选区域删除' },
        { id: TOOLS.MAGIC_ERASER, icon: Wand2, label: '魔术橡皮擦 - 点击删除相同颜色区域' },
        { id: TOOLS.FILL, icon: PaintBucket, label: '填充 (G)' },
        { id: TOOLS.PICKER, icon: Pipette, label: '吸色器 (I)' },
        { id: TOOLS.PAN, icon: Move, label: '移动 (空格)' },
    ];

    return (
        <div className="toolbar glass">
            <div className="toolbar-section">
                <div className="toolbar-title">工具</div>
                <div className="toolbar-tools">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            className={`toolbar-btn ${currentTool === tool.id ? 'active' : ''}`}
                            onClick={() => onToolChange(tool.id)}
                            title={tool.label}
                        >
                            <tool.icon size={20} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-section">
                <div className="toolbar-title">视图</div>
                <div className="toolbar-tools">
                    <button
                        className={`toolbar-btn ${showGrid ? 'active' : ''}`}
                        onClick={onToggleGrid}
                        title="显示/隐藏网格"
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        className={`toolbar-btn ${showNumbers ? 'active' : ''}`}
                        onClick={onToggleNumbers}
                        title="显示/隐藏编号"
                    >
                        <Hash size={20} />
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={onZoomIn}
                        title="放大"
                    >
                        <ZoomIn size={20} />
                    </button>
                    <button
                        className="toolbar-btn"
                        onClick={onZoomOut}
                        title="缩小"
                    >
                        <ZoomOut size={20} />
                    </button>
                </div>
            </div>

            <div className="toolbar-divider" />

            <div className="toolbar-section">
                <div className="toolbar-title">操作</div>
                <div className="toolbar-tools">
                    <button
                        className={`toolbar-btn ${!canUndo ? 'disabled' : ''}`}
                        onClick={onUndo}
                        disabled={!canUndo}
                        title="撤销 (Ctrl+Z)"
                    >
                        <Undo2 size={20} />
                    </button>
                    <button
                        className={`toolbar-btn ${!canRedo ? 'disabled' : ''}`}
                        onClick={onRedo}
                        disabled={!canRedo}
                        title="重做 (Ctrl+Y)"
                    >
                        <Redo2 size={20} />
                    </button>
                    <button
                        className="toolbar-btn danger"
                        onClick={onClear}
                        title="清空画布"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}

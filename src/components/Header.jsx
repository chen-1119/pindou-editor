import React, { useState } from 'react';
import {
    Download,
    Settings,
    Image,
    FileJson,
    Sparkles,
    Upload
} from 'lucide-react';
import './Header.css';

export function Header({
    gridWidth,
    gridHeight,
    onExportImage,
    onOpenSettings,
    onOpenImport,
    pixels
}) {
    const [showExportMenu, setShowExportMenu] = useState(false);

    const pixelCount = Object.keys(pixels).length;

    return (
        <header className="header glass">
            <div className="header-left">
                <div className="logo">
                    <Sparkles className="logo-icon" size={24} />
                    <span className="logo-text">拼豆编辑器</span>
                </div>
            </div>

            <div className="header-center">
                <div className="canvas-info">
                    <span className="info-item">
                        <span className="info-label">画布</span>
                        <span className="info-value">{gridWidth} × {gridHeight}</span>
                    </span>
                    <span className="info-divider">|</span>
                    <span className="info-item">
                        <span className="info-label">豆子</span>
                        <span className="info-value">{pixelCount}</span>
                    </span>
                </div>
            </div>

            <div className="header-right">
                <button className="header-btn" onClick={onOpenImport}>
                    <Upload size={18} />
                    <span>导入图片</span>
                </button>

                <div className="export-wrapper">
                    <button
                        className="header-btn primary"
                        onClick={() => setShowExportMenu(!showExportMenu)}
                    >
                        <Download size={18} />
                        <span>导出</span>
                    </button>

                    {showExportMenu && (
                        <div className="export-menu glass">
                            <button className="export-option" onClick={() => { onExportImage('png'); setShowExportMenu(false); }}>
                                <Image size={16} />
                                <span>导出为 PNG</span>
                            </button>
                            <button className="export-option" onClick={() => { onExportImage('json'); setShowExportMenu(false); }}>
                                <FileJson size={16} />
                                <span>导出为 JSON</span>
                            </button>
                        </div>
                    )}
                </div>

                <button className="header-btn" onClick={onOpenSettings}>
                    <Settings size={18} />
                </button>
            </div>
        </header>
    );
}

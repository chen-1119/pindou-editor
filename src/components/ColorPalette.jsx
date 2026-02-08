import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { BEAD_COLORS, COLOR_CATEGORIES } from '../data/beadColors';
import './ColorPalette.css';

export function ColorPalette({ currentColor, onColorChange }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState('暖色');

    const filteredColors = searchQuery
        ? BEAD_COLORS.filter(c =>
            c.name.includes(searchQuery) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : null;

    const handleColorClick = (color) => {
        onColorChange({ id: color.id, hex: color.hex });
    };

    return (
        <div className="palette glass">
            <div className="palette-header">
                <h3 className="palette-title">色板</h3>
                <span className="palette-brand">Mard</span>
            </div>

            <div className="palette-search">
                <Search size={16} className="search-icon" />
                <input
                    type="text"
                    placeholder="搜索颜色或色号..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="palette-current">
                <div
                    className="current-color"
                    style={{ backgroundColor: currentColor.hex }}
                />
                <div className="current-info">
                    <span className="current-name">
                        {BEAD_COLORS.find(c => c.id === currentColor.id)?.name || '自定义'}
                    </span>
                    <span className="current-code">
                        {BEAD_COLORS.find(c => c.id === currentColor.id)?.code || currentColor.hex}
                    </span>
                </div>
            </div>

            <div className="palette-colors">
                {filteredColors ? (
                    <div className="color-grid">
                        {filteredColors.map(color => (
                            <button
                                key={color.id}
                                className={`color-btn ${currentColor.id === color.id ? 'active' : ''}`}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => handleColorClick(color)}
                                title={`${color.name} (${color.code})`}
                            />
                        ))}
                    </div>
                ) : (
                    Object.entries(COLOR_CATEGORIES).map(([category, colorIds]) => (
                        <div key={category} className="color-category">
                            <button
                                className={`category-header ${expandedCategory === category ? 'expanded' : ''}`}
                                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                            >
                                <span>{category}</span>
                                <ChevronDown size={16} className="category-chevron" />
                            </button>

                            {expandedCategory === category && (
                                <div className="color-grid">
                                    {colorIds.map(id => {
                                        const color = BEAD_COLORS.find(c => c.id === id);
                                        if (!color) return null;
                                        return (
                                            <button
                                                key={color.id}
                                                className={`color-btn ${currentColor.id === color.id ? 'active' : ''}`}
                                                style={{ backgroundColor: color.hex }}
                                                onClick={() => handleColorClick(color)}
                                                title={`${color.name} (${color.code})`}
                                            />
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

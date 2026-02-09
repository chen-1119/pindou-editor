import React from 'react';
import { BEAD_COLORS } from '../data/beadColors';
import './BeadStats.css';

export function BeadStats({ pixels, colorNumberMap }) {
    // 统计拼豆数量
    const counts = {};

    Object.values(pixels).forEach(pixel => {
        if (!counts[pixel.colorId]) {
            const beadInfo = BEAD_COLORS.find(c => c.id === pixel.colorId);
            counts[pixel.colorId] = {
                colorId: pixel.colorId,
                hex: pixel.hex,
                name: beadInfo?.name || '未知',
                code: beadInfo?.code || '-',
                count: 0
            };
        }
        counts[pixel.colorId].count++;
    });

    // 按编号排序（按code字符串排序，如M01, M02... M100）
    const sortedCounts = Object.values(counts).sort((a, b) => {
        const codeA = colorNumberMap?.[a.colorId] || 'ZZZ999';
        const codeB = colorNumberMap?.[b.colorId] || 'ZZZ999';
        // 自然排序（M1 < M2 < M10）
        return codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' });
    });

    const totalCount = sortedCounts.reduce((sum, item) => sum + item.count, 0);

    if (totalCount === 0) {
        return null;
    }

    return (
        <div className="bead-stats glass">
            <div className="stats-header">
                <span className="stats-title">拼豆统计</span>
                <span className="stats-total">{totalCount} 颗</span>
            </div>

            <div className="stats-list">
                {sortedCounts.map(item => (
                    <div key={item.colorId} className="stats-item">
                        <div className="stats-no">
                            {colorNumberMap?.[item.colorId] || '?'}
                        </div>
                        <div
                            className="stats-color"
                            style={{ backgroundColor: item.hex }}
                        />
                        <div className="stats-info">
                            <span className="stats-name">{item.name}</span>
                            <span className="stats-code">{item.code}</span>
                        </div>
                        <span className="stats-count">{item.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

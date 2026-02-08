import React from 'react';
import './ImportModal.css'; // 复用现有的 Modal 样式
import { X, Heart } from 'lucide-react';

export function DonationModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="import-modal" onClick={e => e.stopPropagation()} style={{ width: '400px' }}>
                <div className="modal-header">
                    <div className="modal-title">
                        <Heart className="w-5 h-5 text-red-500 fill-current" style={{ color: '#ef4444' }} />
                        <span>支持作者</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-content" style={{ padding: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        如果这个工具对你有帮助，欢迎打赏支持！<br />
                        你的支持是我更新的动力 ✨
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                        {/* 微信支付海报 */}
                        <div style={{
                            width: '280px',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            border: '1px solid var(--border-color)',
                            minHeight: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8fafc'
                        }}>
                            <img
                                src="/wxpay.jpg"
                                alt="微信支付"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                        <div style="padding: 20px; color: #64748b; font-size: 13px;">
                                            <p style="margin-bottom: 8px">图片未找到 🥲</p>
                                            <p>请将你的收款码命名为 <b>wxpay.jpg</b></p>
                                            <p>并放入项目的 <b>public</b> 文件夹中</p>
                                        </div>
                                    `;
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

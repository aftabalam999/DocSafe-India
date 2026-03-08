import { useState } from 'react';
import { X, Share2, Mail, Shield, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { shareDocument } from '../services/api';

const DOC_ICONS = { aadhaar: '🪪', pan: '💳', passport: '📔', marksheet: '📄', birth_certificate: '📜', driving_license: '🚗', voter_id: '🗳️', other: '📁' };

export default function ShareModal({ doc, onClose, onSuccess }) {
    const [form, setForm] = useState({ sharedWithEmail: '', permission: 'view', expiresAt: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await shareDocument({ documentId: doc._id, ...form, expiresAt: form.expiresAt || undefined });
            toast.success(`Document shared successfully! 🎉`);
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to share document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, background: 'rgba(16,185,129,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Share2 size={18} color="var(--success)" />
                        </div>
                        <h3>Share Document</h3>
                    </div>
                    <button className="modal-close" onClick={onClose} id="share-modal-close"><X size={16} /></button>
                </div>

                <div className="modal-body">
                    <div className="share-doc-preview">
                        <span style={{ fontSize: 28 }}>{DOC_ICONS[doc.type] || '📁'}</span>
                        <div>
                            <h4>{doc.name}</h4>
                            <p>{doc.type?.replace('_', ' ')}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Share with (Email)</label>
                            <div className="input-wrapper">
                                <Mail size={16} className="input-icon" />
                                <input
                                    className="form-input"
                                    type="email"
                                    placeholder="family.member@email.com"
                                    value={form.sharedWithEmail}
                                    onChange={(e) => setForm({ ...form, sharedWithEmail: e.target.value })}
                                    required
                                    id="share-email"
                                />
                            </div>
                        </div>

                        <div className="form-grid-2">
                            <div className="form-group">
                                <label className="form-label">Permission</label>
                                <select
                                    className="form-select"
                                    value={form.permission}
                                    onChange={(e) => setForm({ ...form, permission: e.target.value })}
                                    id="share-permission"
                                >
                                    <option value="view">👁️ View Only</option>
                                    <option value="download">⬇️ View & Download</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Expires On (Optional)</label>
                                <input
                                    className="form-input"
                                    style={{ paddingLeft: 16 }}
                                    type="date"
                                    min={new Date().toISOString().split('T')[0]}
                                    value={form.expiresAt}
                                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                    id="share-expiry"
                                />
                            </div>
                        </div>

                        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10 }}>
                            <Shield size={16} color="var(--primary-light)" style={{ marginTop: 2, flexShrink: 0 }} />
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                The recipient must have a <strong style={{ color: 'var(--text-primary)' }}>DocSafe India account</strong> to access shared documents. You can revoke access anytime.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }} id="share-cancel">Cancel</button>
                            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }} id="share-submit">
                                {loading ? (
                                    <span className="flex flex-center gap-2"><span className="loading-dots"><span /><span /><span /></span> Sharing...</span>
                                ) : (
                                    <span className="flex flex-center gap-2"><Share2 size={14} /> Share Document</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

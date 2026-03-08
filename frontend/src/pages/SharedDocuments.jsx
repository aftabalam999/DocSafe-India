import { useState, useEffect } from 'react';
import { Share2, Eye, Download, X, Clock, Users } from 'lucide-react';
import { getSharedWithMe, getSharedByMe, revokeShare } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DOC_ICONS = { aadhaar: '🪪', pan: '💳', passport: '📔', marksheet: '📄', birth_certificate: '📜', driving_license: '🚗', voter_id: '🗳️', other: '📁' };

function getInitials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'; }

export default function SharedDocuments() {
    const [tab, setTab] = useState('received');
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewDoc, setViewDoc] = useState(null);

    const fetchShares = async () => {
        setLoading(true);
        try {
            const [recRes, sentRes] = await Promise.all([getSharedWithMe(), getSharedByMe()]);
            setReceived(recRes.data.shares);
            setSent(sentRes.data.shares);
        } catch { toast.error('Failed to load shared documents'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchShares(); }, []);

    const handleRevoke = async (id, docName) => {
        if (!window.confirm(`Revoke share for "${docName}"?`)) return;
        try {
            await revokeShare(id);
            toast.success('Share revoked');
            fetchShares();
        } catch { toast.error('Failed to revoke'); }
    };

    const shares = tab === 'received' ? received : sent;

    return (
        <DashboardLayout>
            {viewDoc && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewDoc(null)}>
                    <div className="doc-viewer-modal">
                        <div className="doc-viewer-header">
                            <span style={{ fontSize: 24 }}>{DOC_ICONS[viewDoc.document?.type] || '📁'}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{viewDoc.document?.name}</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Shared by {viewDoc.sharedBy?.name}</p>
                            </div>
                            <button className="modal-close" onClick={() => setViewDoc(null)}><span>✕</span></button>
                        </div>
                        <div className="doc-viewer-content">
                            {viewDoc.document?.fileType === 'image' ? (
                                <img src={viewDoc.document?.fileUrl} alt={viewDoc.document?.name} />
                            ) : (
                                <iframe src={viewDoc.document?.fileUrl} title={viewDoc.document?.name} />
                            )}
                        </div>
                        <div className="doc-viewer-footer">
                            {viewDoc.permission === 'download' && (
                                <a href={viewDoc.document?.fileUrl} download target="_blank" rel="noreferrer">
                                    <button className="btn-secondary btn-icon"><Download size={14} /> Download</button>
                                </a>
                            )}
                            <button className="btn-danger" onClick={() => setViewDoc(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <p className="breadcrumb">Home / Shared Documents</p>
                <h1>Shared Documents</h1>
                <p>Documents shared with you and documents you've shared with family</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                <button className={`filter-chip ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')} id="tab-received">
                    📥 Shared With Me ({received.length})
                </button>
                <button className={`filter-chip ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')} id="tab-sent">
                    📤 Shared By Me ({sent.length})
                </button>
            </div>

            {loading ? (
                <div className="spinner" />
            ) : shares.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Share2 size={56} />
                        <h3>{tab === 'received' ? 'No Documents Shared With You' : 'You Haven\'t Shared Any Documents'}</h3>
                        <p>{tab === 'received' ? 'Ask a family member to share documents with you' : 'Share documents with family members from My Documents'}</p>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body no-pad">
                        <div className="table-wrapper">
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Type</th>
                                        <th>{tab === 'received' ? 'Shared By' : 'Shared With'}</th>
                                        <th>Permission</th>
                                        <th>Expires</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {shares.map((share) => {
                                        const doc = share.document;
                                        const person = tab === 'received' ? share.sharedBy : share.sharedWith;
                                        return (
                                            <tr key={share._id}>
                                                <td>
                                                    <div className="doc-name-cell">
                                                        <div className="doc-icon" style={{ background: 'rgba(99,102,241,0.1)', fontSize: 20 }}>
                                                            {DOC_ICONS[doc?.type] || '📁'}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{doc?.name}</span>
                                                    </div>
                                                </td>
                                                <td><span className={`doc-type-badge badge-${doc?.type}`}>{doc?.type?.replace('_', ' ')}</span></td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{getInitials(person?.name)}</div>
                                                        <div>
                                                            <p style={{ fontSize: 13, fontWeight: 600 }}>{person?.name}</p>
                                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{person?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: 12, fontWeight: 700, color: share.permission === 'download' ? 'var(--warning)' : 'var(--primary-light)' }}>
                                                        {share.permission === 'download' ? '⬇️ Download' : '👁️ View Only'}
                                                    </span>
                                                </td>
                                                <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                    {share.expiresAt ? format(new Date(share.expiresAt), 'dd MMM yyyy') : 'No expiry'}
                                                </td>
                                                <td>
                                                    <div className="actions-cell">
                                                        {tab === 'received' && doc?.fileUrl && (
                                                            <button className="action-btn" title="View" onClick={() => setViewDoc(share)} id={`view-share-${share._id}`}><Eye size={14} /></button>
                                                        )}
                                                        {tab === 'sent' && (
                                                            <button className="action-btn danger" title="Revoke" onClick={() => handleRevoke(share._id, doc?.name)} id={`revoke-${share._id}`}><X size={14} /></button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

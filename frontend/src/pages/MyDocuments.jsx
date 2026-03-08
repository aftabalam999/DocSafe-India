import { useState, useEffect } from 'react';
import { FolderOpen, Search, Trash2, Eye, Share2, Download, Filter } from 'lucide-react';
import { getMyDocuments, deleteDocument } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import UploadModal from '../components/UploadModal';
import ShareModal from '../components/ShareModal';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DOC_TYPES = ['all', 'aadhaar', 'pan', 'passport', 'marksheet', 'birth_certificate', 'driving_license', 'voter_id', 'other'];
const DOC_ICONS = { aadhaar: '🪪', pan: '💳', passport: '📔', marksheet: '📄', birth_certificate: '📜', driving_license: '🚗', voter_id: '🗳️', other: '📁' };

function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MyDocuments() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [showUpload, setShowUpload] = useState(false);
    const [viewDoc, setViewDoc] = useState(null);
    const [shareDoc, setShareDoc] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (typeFilter !== 'all') params.type = typeFilter;
            const res = await getMyDocuments(params);
            setDocs(res.data.documents);
            setTotal(res.data.total);
        } catch (err) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDocs(); }, [search, typeFilter, page]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
        try {
            await deleteDocument(id);
            toast.success(`"${name}" deleted`);
            fetchDocs();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const totalPages = Math.ceil(total / 10);

    return (
        <DashboardLayout onUploadClick={() => setShowUpload(true)}>
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchDocs} />}
            {shareDoc && <ShareModal doc={shareDoc} onClose={() => setShareDoc(null)} onSuccess={fetchDocs} />}
            {viewDoc && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setViewDoc(null)}>
                    <div className="doc-viewer-modal">
                        <div className="doc-viewer-header">
                            <span style={{ fontSize: 24 }}>{DOC_ICONS[viewDoc.type] || '📁'}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{viewDoc.name}</h3>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{viewDoc.type?.replace('_', ' ')} • {formatSize(viewDoc.fileSize)}</p>
                            </div>
                            <button className="modal-close" onClick={() => setViewDoc(null)}><span>✕</span></button>
                        </div>
                        <div className="doc-viewer-content">
                            {viewDoc.fileType === 'image' ? (
                                <img src={viewDoc.fileUrl} alt={viewDoc.name} />
                            ) : (
                                <iframe src={viewDoc.fileUrl} title={viewDoc.name} />
                            )}
                        </div>
                        <div className="doc-viewer-footer">
                            <a href={viewDoc.fileUrl} download target="_blank" rel="noreferrer">
                                <button className="btn-secondary btn-icon" id="doc-download"><Download size={14} /> Download</button>
                            </a>
                            <button className="btn-danger" onClick={() => setViewDoc(null)} id="doc-viewer-close">Close</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-header">
                <p className="breadcrumb">Home / Documents</p>
                <h1>My Documents</h1>
                <p>Manage and organize all your uploaded documents</p>
            </div>

            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <div className="input-wrapper" style={{ flex: 1, minWidth: 200 }}>
                    <Search size={16} className="input-icon" />
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        id="doc-search"
                    />
                </div>

                <div className="filter-bar" style={{ margin: 0 }}>
                    {DOC_TYPES.map((type) => (
                        <button
                            key={type}
                            className={`filter-chip ${typeFilter === type ? 'active' : ''}`}
                            onClick={() => { setTypeFilter(type); setPage(1); }}
                            id={`filter-${type}`}
                        >
                            {type === 'all' ? 'All' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3><FolderOpen size={16} style={{ display: 'inline', marginRight: 8 }} />Documents ({total})</h3>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }} onClick={() => setShowUpload(true)} id="upload-new">
                        + Upload New
                    </button>
                </div>
                <div className="card-body no-pad">
                    {loading ? (
                        <div className="spinner" />
                    ) : docs.length === 0 ? (
                        <div className="empty-state">
                            <FolderOpen size={56} />
                            <h3>No Documents Found</h3>
                            <p>{search || typeFilter !== 'all' ? 'Try a different search or filter' : 'Upload your first document to get started'}</p>
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="doc-table">
                                <thead>
                                    <tr>
                                        <th>Document</th>
                                        <th>Type</th>
                                        <th>Size</th>
                                        <th>Uploaded</th>
                                        <th>Shared</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {docs.map((doc) => (
                                        <tr key={doc._id}>
                                            <td>
                                                <div className="doc-name-cell">
                                                    <div className="doc-icon" style={{ background: 'rgba(99,102,241,0.1)', fontSize: 20 }}>
                                                        {DOC_ICONS[doc.type] || '📁'}
                                                    </div>
                                                    <div>
                                                        <p style={{ fontWeight: 600, fontSize: 14 }}>{doc.name}</p>
                                                        {doc.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{doc.description.slice(0, 40)}...</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td><span className={`doc-type-badge badge-${doc.type}`}>{doc.type?.replace('_', ' ')}</span></td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{formatSize(doc.fileSize)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{format(new Date(doc.uploadedAt), 'dd MMM yyyy')}</td>
                                            <td>
                                                {doc.isShared ? (
                                                    <span style={{ color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>✓ Shared</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Private</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="actions-cell">
                                                    <button className="action-btn" title="View" onClick={() => setViewDoc(doc)} id={`view-${doc._id}`}><Eye size={14} /></button>
                                                    <button className="action-btn success" title="Share" onClick={() => setShareDoc(doc)} id={`share-${doc._id}`}><Share2 size={14} /></button>
                                                    <button className="action-btn danger" title="Delete" onClick={() => handleDelete(doc._id, doc.name)} id={`delete-${doc._id}`}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
                </div>
            )}
        </DashboardLayout>
    );
}

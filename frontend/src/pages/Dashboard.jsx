import { useState, useEffect } from 'react';
import {
    FileText, Share2, Users, HardDrive, Upload, User,
    Zap, Clock, TrendingUp, FolderOpen
} from 'lucide-react';
import { getDashboardStats, getActivityLogs } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import UploadModal from '../components/UploadModal';
import ShareModal from '../components/ShareModal';
import { format } from 'date-fns';

const DOC_ICONS = { aadhaar: '🪪', pan: '💳', passport: '📔', marksheet: '📄', birth_certificate: '📜', driving_license: '🚗', voter_id: '🗳️', other: '📁' };
const ACTION_ICONS = { upload_document: '📤', delete_document: '🗑️', share_document: '🤝', login: '🔐', logout: '🚪', view_document: '👁️', download_document: '⬇️', add_family_member: '👨‍👩‍👧', otp_verified: '✅', update_profile: '👤', default: '📋' };
const ACTION_COLORS = { upload_document: '#6366f1', delete_document: '#ef4444', share_document: '#10b981', login: '#06b6d4', download_document: '#f59e0b', default: '#8b5cf6' };

function formatStorage(bytes) {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [recentDocs, setRecentDocs] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [shareDoc, setShareDoc] = useState(null);

    const fetchData = async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([getDashboardStats(), getActivityLogs({ limit: 6 })]);
            setStats(statsRes.data.stats);
            setRecentDocs(statsRes.data.recentDocuments);
            setLogs(logsRes.data.logs);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const statCards = [
        { label: 'Total Documents', value: stats?.totalDocuments ?? 0, icon: FileText, color: 'indigo', sub: 'All uploaded files' },
        { label: 'Shared Documents', value: stats?.sharedDocuments ?? 0, icon: Share2, color: 'purple', sub: 'Shared with family' },
        { label: 'Family Members', value: stats?.familyMembers ?? 0, icon: Users, color: 'cyan', sub: 'Connected members' },
        { label: 'Storage Used', value: formatStorage(stats?.storageUsed), icon: HardDrive, color: 'emerald', sub: 'Out of 100 MB free' },
    ];

    const storagePercent = stats ? Math.min((stats.storageUsed / (100 * 1024 * 1024)) * 100, 100) : 0;

    return (
        <DashboardLayout onUploadClick={() => setShowUpload(true)}>
            {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSuccess={fetchData} />}
            {shareDoc && <ShareModal doc={shareDoc} onClose={() => setShareDoc(null)} onSuccess={fetchData} />}

            {/* Page Header */}
            <div className="page-header">
                <p className="breadcrumb">Home / Dashboard</p>
                <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p>Here's an overview of your secure document vault</p>
            </div>

            {/* Stats Grid */}
            {loading ? (
                <div className="spinner" />
            ) : (
                <>
                    <div className="stats-grid">
                        {statCards.map((card) => {
                            const Icon = card.icon;
                            return (
                                <div key={card.label} className={`stat-card ${card.color}`}>
                                    <div className={`stat-icon ${card.color}`}><Icon size={22} /></div>
                                    <p className="stat-label">{card.label}</p>
                                    <p className="stat-value">{card.value}</p>
                                    <p className="stat-sub">{card.sub}</p>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>
                        {/* Quick Actions */}
                        <div className="card">
                            <div className="card-header">
                                <h3><Zap size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--warning)' }} />Quick Actions</h3>
                            </div>
                            <div className="card-body">
                                <div className="quick-actions">
                                    <button className="quick-action-btn" onClick={() => setShowUpload(true)} id="qa-upload">
                                        <div className="qab-icon" style={{ background: 'rgba(99,102,241,0.15)' }}><Upload size={18} color="var(--primary-light)" /></div>
                                        Upload Document
                                    </button>
                                    <button className="quick-action-btn" onClick={() => window.location.href = '/family'} id="qa-family">
                                        <div className="qab-icon" style={{ background: 'rgba(6,182,212,0.15)' }}><User size={18} color="var(--accent)" /></div>
                                        Add Family Member
                                    </button>
                                    <button className="quick-action-btn" onClick={() => window.location.href = '/documents'} id="qa-docs">
                                        <div className="qab-icon" style={{ background: 'rgba(16,185,129,0.15)' }}><FolderOpen size={18} color="var(--success)" /></div>
                                        View Documents
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Storage */}
                        <div className="card">
                            <div className="card-header">
                                <h3><HardDrive size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--success)' }} />Storage</h3>
                            </div>
                            <div className="card-body">
                                <div className="storage-bar">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Used</span>
                                        <span style={{ fontSize: 13, fontWeight: 700 }}>{storagePercent.toFixed(1)}%</span>
                                    </div>
                                    <div className="bar-bg">
                                        <div className="bar-fill" style={{ width: `${storagePercent}%` }} />
                                    </div>
                                    <div className="bar-label">
                                        <span>{formatStorage(stats?.storageUsed)}</span>
                                        <span>100 MB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                        {/* Recent Documents */}
                        <div className="card">
                            <div className="card-header">
                                <h3><FolderOpen size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--primary-light)' }} />Recent Documents</h3>
                                <button className="btn-secondary" onClick={() => window.location.href = '/documents'} id="view-all-docs">View All</button>
                            </div>
                            <div className="card-body no-pad">
                                {recentDocs.length === 0 ? (
                                    <div className="empty-state">
                                        <FolderOpen size={48} />
                                        <h3>No Documents Yet</h3>
                                        <p>Upload your first document to get started</p>
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="doc-table">
                                            <thead>
                                                <tr>
                                                    <th>Document</th>
                                                    <th>Type</th>
                                                    <th>Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {recentDocs.map((doc) => (
                                                    <tr key={doc._id}>
                                                        <td>
                                                            <div className="doc-name-cell">
                                                                <div className="doc-icon" style={{ background: 'rgba(99,102,241,0.1)', fontSize: 18 }}>
                                                                    {DOC_ICONS[doc.type] || '📁'}
                                                                </div>
                                                                <span style={{ fontSize: 14, fontWeight: 600 }}>{doc.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`doc-type-badge badge-${doc.type}`}>{doc.type?.replace('_', ' ')}</span>
                                                        </td>
                                                        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                                                            {format(new Date(doc.uploadedAt), 'dd MMM yy')}
                                                        </td>
                                                        <td>
                                                            <button className="action-btn success" title="Share" onClick={() => setShareDoc(doc)}>
                                                                <Share2 size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card">
                            <div className="card-header">
                                <h3><Clock size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />Recent Activity</h3>
                                <button className="btn-secondary" onClick={() => window.location.href = '/activity'} id="view-all-activity">View All</button>
                            </div>
                            <div className="card-body">
                                {logs.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '30px 10px' }}>
                                        <p>No activity yet</p>
                                    </div>
                                ) : (
                                    <div className="activity-list">
                                        {logs.slice(0, 5).map((log) => (
                                            <div key={log._id} className="activity-item">
                                                <div
                                                    className="activity-icon"
                                                    style={{ background: `${ACTION_COLORS[log.action] || ACTION_COLORS.default}15` }}
                                                >
                                                    <span style={{ fontSize: 16 }}>{ACTION_ICONS[log.action] || ACTION_ICONS.default}</span>
                                                </div>
                                                <div className="activity-content">
                                                    <p>{log.description}</p>
                                                    <span>{format(new Date(log.createdAt), 'dd MMM, hh:mm a')}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </DashboardLayout>
    );
}

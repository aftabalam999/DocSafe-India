import { useState, useEffect } from 'react';
import { Activity, LogIn, LogOut, Upload, Trash2, Share2, Eye, Download, User, Users, CheckCircle } from 'lucide-react';
import { getActivityLogs } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

const ACTION_CONFIG = {
    login: { label: 'Logged In', icon: LogIn, bg: 'rgba(6,182,212,0.12)', color: '#22d3ee' },
    logout: { label: 'Logged Out', icon: LogOut, bg: 'rgba(148,163,184,0.12)', color: '#94a3b8' },
    register: { label: 'Registered', icon: User, bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    upload_document: { label: 'Document Uploaded', icon: Upload, bg: 'rgba(99,102,241,0.12)', color: '#818cf8' },
    delete_document: { label: 'Document Deleted', icon: Trash2, bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
    update_document: { label: 'Document Updated', icon: Upload, bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    share_document: { label: 'Document Shared', icon: Share2, bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
    revoke_share: { label: 'Share Revoked', icon: Share2, bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
    view_document: { label: 'Document Viewed', icon: Eye, bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' },
    download_document: { label: 'Document Downloaded', icon: Download, bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    add_family_member: { label: 'Family Member Added', icon: Users, bg: 'rgba(6,182,212,0.12)', color: '#22d3ee' },
    remove_family_member: { label: 'Family Member Removed', icon: Users, bg: 'rgba(239,68,68,0.12)', color: '#f87171' },
    update_profile: { label: 'Profile Updated', icon: User, bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' },
    otp_verified: { label: 'Email Verified', icon: CheckCircle, bg: 'rgba(16,185,129,0.12)', color: '#34d399' },
};

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await getActivityLogs({ page, limit: 20 });
            setLogs(res.data.logs);
            setTotal(res.data.total);
        } catch { toast.error('Failed to load activity logs'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [page]);

    const totalPages = Math.ceil(total / 20);

    return (
        <DashboardLayout>
            <div className="page-header">
                <p className="breadcrumb">Home / Activity Logs</p>
                <h1>Activity Logs</h1>
                <p>Complete history of all your account activities</p>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3><Activity size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />All Activities ({total})</h3>
                </div>
                <div className="card-body no-pad">
                    {loading ? (
                        <div className="spinner" />
                    ) : logs.length === 0 ? (
                        <div className="empty-state">
                            <Activity size={56} />
                            <h3>No Activity Yet</h3>
                            <p>Your account activity will appear here</p>
                        </div>
                    ) : (
                        <>
                            {logs.map((log) => {
                                const config = ACTION_CONFIG[log.action] || { label: log.action, bg: 'rgba(99,102,241,0.12)', color: '#818cf8' };
                                const Icon = config.icon || Activity;
                                return (
                                    <div key={log._id} className="log-item">
                                        <div className="log-icon" style={{ background: config.bg }}>
                                            <Icon size={16} color={config.color} />
                                        </div>
                                        <div className="log-content">
                                            <p className="log-action">{config.label}</p>
                                            <p className="log-desc">{log.description}</p>
                                            <p className="log-time" title={format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm:ss a')}>
                                                🕐 {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{format(new Date(log.createdAt), 'dd MMM')}</p>
                                            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(log.createdAt), 'hh:mm a')}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>←</button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                        <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    ))}
                    {totalPages > 5 && <span style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>}
                    <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>→</button>
                </div>
            )}
        </DashboardLayout>
    );
}

import { useState } from 'react';
import { User, Mail, Phone, Shield, Save, CheckCircle } from 'lucide-react';
import { updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

function getInitials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'; }

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(form);
            await refreshUser();
            toast.success('Profile updated successfully! ✅');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <p className="breadcrumb">Home / Profile</p>
                <h1>My Profile</h1>
                <p>Manage your personal information and account details</p>
            </div>

            {/* Profile Header */}
            <div className="profile-header">
                <div className="profile-avatar">{getInitials(user?.name)}</div>
                <div className="profile-info">
                    <h2>{user?.name}</h2>
                    <p>{user?.email}</p>
                    <div className="verified-badge">
                        <CheckCircle size={12} /> Verified Account
                    </div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Member Since</p>
                    <p style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>
                        {user?.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : '—'}
                    </p>
                    <span style={{ display: 'inline-block', marginTop: 8, fontSize: 12, background: 'rgba(99,102,241,0.12)', color: 'var(--primary-light)', padding: '3px 10px', borderRadius: 99, fontWeight: 700, textTransform: 'capitalize' }}>
                        🛡️ {user?.role}
                    </span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                {/* Edit Profile Form */}
                <div className="card">
                    <div className="card-header">
                        <h3><User size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--primary-light)' }} />Personal Information</h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <div className="input-wrapper">
                                    <User size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        id="profile-name"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type="email"
                                        value={user?.email || ''}
                                        disabled
                                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                                        id="profile-email"
                                    />
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="input-wrapper">
                                    <Phone size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        id="profile-phone"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading} id="profile-save">
                                {loading ? 'Saving...' : <span className="btn-icon"><Save size={14} /> Save Changes</span>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Security Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <div className="card-header">
                            <h3><Shield size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--success)' }} />Security</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {[
                                    { icon: '✅', label: 'Email Verified', status: user?.isVerified ? 'Verified' : 'Not Verified', ok: user?.isVerified },
                                    { icon: '🔐', label: 'JWT Authentication', status: 'Active', ok: true },
                                    { icon: '☁️', label: 'Cloud Storage', status: 'Cloudinary', ok: true },
                                    { icon: '🛡️', label: 'Account Role', status: user?.role?.toUpperCase(), ok: true },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 18 }}>{item.icon}</span>
                                            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: item.ok ? 'var(--success)' : 'var(--danger)' }}>
                                            {item.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h3>📊 Account Stats</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { label: 'Family Members', value: user?.familyMembers?.length || 0 },
                                    { label: 'Documents Uploaded', value: '→ Check Dashboard' },
                                ].map((item) => (
                                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

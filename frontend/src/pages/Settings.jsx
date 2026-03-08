import { useState } from 'react';
import { Settings, Bell, Moon, Sun, Shield, Lock, Eye, Globe, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifShare, setNotifShare] = useState(true);
    const [privacy, setPrivacy] = useState('private');
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        setTimeout(() => { setSaving(false); toast.success('Settings saved!'); }, 800);
    };

    const Toggle = ({ checked, onChange, id }) => (
        <div
            id={id}
            onClick={onChange}
            style={{
                width: 44, height: 24, background: checked ? 'var(--primary)' : 'var(--bg-elevated)',
                borderRadius: 99, position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
                border: `1px solid ${checked ? 'var(--primary)' : 'var(--border)'}`,
            }}
        >
            <div style={{
                width: 18, height: 18, background: 'white', borderRadius: '50%',
                position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }} />
        </div>
    );

    return (
        <DashboardLayout>
            <div className="page-header">
                <p className="breadcrumb">Home / Settings</p>
                <h1>Settings</h1>
                <p>Customize your DocSafe India experience</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>
                {/* Notifications */}
                <div className="card">
                    <div className="card-header">
                        <h3><Bell size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--warning)' }} />Notifications</h3>
                    </div>
                    <div className="card-body">
                        {[
                            { label: 'Email Notifications', desc: 'Receive email alerts for important activity', checked: notifEmail, onChange: () => setNotifEmail(!notifEmail), id: 'toggle-email-notif' },
                            { label: 'Share Notifications', desc: 'Notify when someone shares a document with you', checked: notifShare, onChange: () => setNotifShare(!notifShare), id: 'toggle-share-notif' },
                        ].map((item) => (
                            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 14 }}>{item.label}</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</p>
                                </div>
                                <Toggle checked={item.checked} onChange={item.onChange} id={item.id} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy */}
                <div className="card">
                    <div className="card-header">
                        <h3><Lock size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--danger)' }} />Privacy & Security</h3>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label className="form-label">Default Document Visibility</label>
                            <select className="form-select" value={privacy} onChange={(e) => setPrivacy(e.target.value)} id="privacy-select">
                                <option value="private">🔒 Private (Only me)</option>
                                <option value="family">👨‍👩‍👧 Family Only (With permission)</option>
                            </select>
                        </div>
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
                            <p style={{ fontSize: 13, color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>🔐 Security Note</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                All documents are stored securely on Cloudinary with JWT-protected access.
                                Only authorized users can view your uploaded documents.
                            </p>
                        </div>
                    </div>
                </div>

                {/* About */}
                <div className="card">
                    <div className="card-header">
                        <h3><Globe size={16} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }} />About DocSafe India</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {[
                                ['Version', 'v1.0.0'],
                                ['Stack', 'MERN (MongoDB, Express, React, Node.js)'],
                                ['Authentication', 'JWT + OTP Email Verification'],
                                ['File Storage', 'Cloudinary Cloud Storage'],
                                ['Max File Size', '10 MB per document'],
                            ].map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(99,102,241,0.07)' }}>
                                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{key}</span>
                                    <span style={{ fontSize: 14, fontWeight: 600 }}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button className="btn-primary" onClick={handleSave} disabled={saving} id="save-settings" style={{ alignSelf: 'flex-start', padding: '12px 32px' }}>
                    {saving ? 'Saving...' : <span className="btn-icon"><Save size={14} /> Save Settings</span>}
                </button>
            </div>
        </DashboardLayout>
    );
}

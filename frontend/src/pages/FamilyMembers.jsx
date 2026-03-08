import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Heart } from 'lucide-react';
import { getFamilyMembers, addFamilyMember, removeFamilyMember } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import toast from 'react-hot-toast';

const RELATIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Spouse', 'Son', 'Daughter', 'Grandfather', 'Grandmother', 'Uncle', 'Aunt', 'Other'];

function getInitials(name) { return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'; }

const RELATION_EMOJIS = { Father: '👨', Mother: '👩', Brother: '👦', Sister: '👧', Spouse: '💑', Son: '🧒', Daughter: '👧', Grandfather: '👴', Grandmother: '👵', Uncle: '👨', Aunt: '👩', Other: '👤' };

export default function FamilyMembers() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ email: '', relation: '' });
    const [adding, setAdding] = useState(false);

    const fetchMembers = async () => {
        try {
            const res = await getFamilyMembers();
            setMembers(res.data.familyMembers);
        } catch { toast.error('Failed to load family members'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchMembers(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setAdding(true);
        try {
            await addFamilyMember(form);
            toast.success('Family member added! 👨‍👩‍👧');
            setShowAdd(false);
            setForm({ email: '', relation: '' });
            fetchMembers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add member');
        } finally {
            setAdding(false);
        }
    };

    const handleRemove = async (memberId, name) => {
        if (!window.confirm(`Remove ${name} from your family?`)) return;
        try {
            await removeFamilyMember(memberId);
            toast.success(`${name} removed`);
            fetchMembers();
        } catch { toast.error('Failed to remove member'); }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <p className="breadcrumb">Home / Family Members</p>
                <h1>Family Members</h1>
                <p>Manage your connected family members to share documents with them</p>
            </div>

            {/* Add Member Modal */}
            {showAdd && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 36, height: 36, background: 'rgba(6,182,212,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserPlus size={18} color="var(--accent)" />
                                </div>
                                <h3>Add Family Member</h3>
                            </div>
                            <button className="modal-close" onClick={() => setShowAdd(false)} id="add-family-close">✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAdd}>
                                <div className="form-group">
                                    <label className="form-label">Member's Email Address</label>
                                    <div className="input-wrapper">
                                        <Mail size={16} className="input-icon" />
                                        <input
                                            className="form-input"
                                            type="email"
                                            placeholder="family@email.com"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                            id="family-email"
                                        />
                                    </div>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                        They must have a DocSafe India account
                                    </p>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Relation</label>
                                    <select
                                        className="form-select"
                                        value={form.relation}
                                        onChange={(e) => setForm({ ...form, relation: e.target.value })}
                                        required
                                        id="family-relation"
                                    >
                                        <option value="">Select relation...</option>
                                        {RELATIONS.map((r) => <option key={r} value={r}>{RELATION_EMOJIS[r]} {r}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowAdd(false)} style={{ flex: 1 }} id="add-family-cancel">Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={adding} style={{ flex: 2 }} id="add-family-submit">
                                        {adding ? 'Adding...' : '👨‍👩‍👧 Add Family Member'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                <button className="btn-primary" style={{ padding: '10px 20px' }} onClick={() => setShowAdd(true)} id="add-family-btn">
                    <span className="btn-icon"><UserPlus size={15} /> Add Family Member</span>
                </button>
            </div>

            {/* Family Grid */}
            {loading ? (
                <div className="spinner" />
            ) : members.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Users size={56} />
                        <h3>No Family Members Yet</h3>
                        <p>Add family members to start sharing important documents securely</p>
                    </div>
                </div>
            ) : (
                <div className="family-grid">
                    {members.map((member) => (
                        <div key={member._id || member.userId?._id} className="family-card">
                            <div className="avatar" >{getInitials(member.name)}</div>
                            <h4>{member.name}</h4>
                            <p>{member.userId?.email || ''}</p>
                            <span className="relation-badge">{RELATION_EMOJIS[member.relation] || '👤'} {member.relation}</span>
                            <div style={{ marginTop: 14 }}>
                                <button
                                    className="btn-danger"
                                    style={{ width: '100%', fontSize: 12 }}
                                    onClick={() => handleRemove(member.userId?._id || member.userId, member.name)}
                                    id={`remove-member-${member.userId?._id || member.userId}`}
                                >
                                    <span className="btn-icon"><Trash2 size={12} /> Remove</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

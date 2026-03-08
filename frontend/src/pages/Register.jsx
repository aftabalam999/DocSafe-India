import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { register } from '../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
        setLoading(true);
        try {
            const res = await register(form);
            toast.success(res.data.message);
            navigate('/verify-otp', { state: { email: form.email, name: form.name } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-orb auth-bg-orb-1" />
            <div className="auth-bg-orb auth-bg-orb-2" />

            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Shield size={28} />
                    </div>
                    <h1>DocSafe India</h1>
                    <p>Secure Government Document Storage</p>
                </div>

                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join thousands of families securing their documents</p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrapper">
                            <User size={16} className="input-icon" />
                            <input
                                className="form-input"
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={form.name}
                                onChange={handleChange}
                                required
                                id="reg-name"
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
                                name="email"
                                placeholder="Enter your email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                id="reg-email"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <div className="input-wrapper">
                            <Phone size={16} className="input-icon" />
                            <input
                                className="form-input"
                                type="tel"
                                name="phone"
                                placeholder="+91 98765 43210"
                                value={form.phone}
                                onChange={handleChange}
                                id="reg-phone"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <Lock size={16} className="input-icon" />
                            <input
                                className="form-input"
                                type={showPass ? 'text' : 'password'}
                                name="password"
                                placeholder="Minimum 6 characters"
                                value={form.password}
                                onChange={handleChange}
                                required
                                id="reg-password"
                            />
                            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} id="reg-submit">
                        {loading ? (
                            <span className="flex flex-center gap-2">
                                <span className="loading-dots"><span /><span /><span /></span> Creating account...
                            </span>
                        ) : (
                            'Create Account →'
                        )}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account? <Link to="/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
}

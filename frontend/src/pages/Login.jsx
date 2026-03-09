import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const { loginUser } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginApi(form);
            loginUser(res.data.token, res.data.user);
            toast.success(`Welcome back, ${res.data.user.name}! 👋`);
            navigate('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            if (data?.needsVerification) {
                toast.error('Please verify your email first.');
                navigate('/verify-otp', { state: { email: form.email } });
            } else {
                toast.error(data?.message || 'Login failed');
            }
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

                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Sign in to access your secure document vault</p>

                <form onSubmit={handleSubmit}>
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
                                id="login-email"
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
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                id="login-password"
                            />
                            <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} id="login-submit">
                        {loading ? (
                            <span className="flex flex-center gap-2">
                                <span className="loading-dots"><span /><span /><span /></span> Signing in...
                            </span>
                        ) : (
                            'Sign In →'
                        )}
                    </button>

                    <div style={{ textAlign: 'right', marginTop: '12px' }}>
                        <Link to="/forgot-password" style={{ color: 'var(--primary-light)', fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>
                            Forgot Password?
                        </Link>
                    </div>
                </form>

                <p className="auth-link">
                    Don't have an account? <Link to="/register">Create one here</Link>
                </p>
            </div>
        </div>
    );
}

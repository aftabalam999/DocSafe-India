import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyOtp, resendOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { loginUser } = useAuth();
    const email = location.state?.email || '';
    const name = location.state?.name || '';
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) navigate('/register');
        inputRefs.current[0]?.focus();
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer]);

    const handleChange = (idx, val) => {
        if (!/^\d?$/.test(val)) return;
        const newOtp = [...otp];
        newOtp[idx] = val;
        setOtp(newOtp);
        if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx, e) => {
        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (text.length === 6) {
            setOtp(text.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return toast.error('Please enter all 6 digits');
        setLoading(true);
        try {
            const res = await verifyOtp({ email, otp: code });
            loginUser(res.data.token, res.data.user);
            toast.success('Email verified! Welcome to DocSafe India 🎉');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await resendOtp({ email });
            setResendTimer(60);
            toast.success('OTP resent successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-bg-orb auth-bg-orb-1" />
            <div className="auth-bg-orb auth-bg-orb-2" />

            <div className="auth-card" style={{ maxWidth: '420px' }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Shield size={28} />
                    </div>
                    <h1>DocSafe India</h1>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <Mail size={28} color="var(--primary-light)" />
                    </div>
                    <h2 className="auth-title">Verify Your Email</h2>
                    <p className="auth-subtitle">
                        We sent a 6-digit code to<br />
                        <strong style={{ color: 'var(--primary-light)' }}>{email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="otp-inputs" onPaste={handlePaste}>
                        {otp.map((digit, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputRefs.current[idx] = el)}
                                className="otp-digit"
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(idx, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(idx, e)}
                                id={`otp-${idx}`}
                            />
                        ))}
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading} id="otp-submit">
                        {loading ? (
                            <span className="flex flex-center gap-2">
                                <span className="loading-dots"><span /><span /><span /></span> Verifying...
                            </span>
                        ) : (
                            'Verify & Continue →'
                        )}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    {resendTimer > 0 ? (
                        <>Resend OTP in <strong style={{ color: 'var(--primary-light)' }}>{resendTimer}s</strong></>
                    ) : (
                        <button
                            onClick={handleResend}
                            className="btn-icon"
                            style={{ background: 'none', border: 'none', color: 'var(--primary-light)', fontWeight: 700, cursor: 'pointer' }}
                        >
                            <RotateCcw size={14} /> Resend OTP
                        </button>
                    )}
                </p>
            </div>
        </div>
    );
}

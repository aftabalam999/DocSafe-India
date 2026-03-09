import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, Eye, EyeOff, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword, resetPassword } from '../services/api';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // OTP handling similar to VerifyOtp
    const inputRefs = useRef([]);
    const [resendTimer, setResendTimer] = useState(60);

    useEffect(() => {
        if (step === 2 && resendTimer > 0) {
            const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendTimer, step]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return toast.error('Please enter your email');
        setLoading(true);
        try {
            await forgotPassword({ email });
            toast.success('OTP sent to your email!');
            setStep(2);
            setResendTimer(60);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await forgotPassword({ email });
            setResendTimer(60);
            toast.success('OTP resent successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to resend OTP');
        }
    };

    const handleOtpChange = (idx, val) => {
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

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) return toast.error('Please enter all 6 digits of the OTP');
        setStep(3); // Proceed to step 3 to ask for password
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
        if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

        setLoading(true);
        try {
            await resetPassword({ email, otp: code, newPassword });
            toast.success('Password updated successfully! You can now login.');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
            if (err.response?.data?.message?.toLowerCase().includes('otp')) {
                setStep(2); // Go back to OTP screen if OTP was incorrect or expired
            }
        } finally {
            setLoading(false);
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

                {step === 1 && (
                    <>
                        <h2 className="auth-title">Forgot Password</h2>
                        <p className="auth-subtitle">Enter your registered email to receive an OTP to reset your password.</p>

                        <form onSubmit={handleSendOtp}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <button className="btn-primary" type="submit" disabled={loading}>
                                {loading ? (
                                    <span className="flex flex-center gap-2">
                                        <span className="loading-dots"><span /><span /><span /></span> Sending...
                                    </span>
                                ) : (
                                    'Send OTP →'
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ marginTop: '12px' }}
                                onClick={() => navigate('/login')}
                            >
                                ← Back to Login
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div style={{ width: 64, height: 64, background: 'rgba(99,102,241,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                <Mail size={28} color="var(--primary-light)" />
                            </div>
                            <h2 className="auth-title">Verify OTP</h2>
                            <p className="auth-subtitle">
                                Enter the 6-digit code sent to<br />
                                <strong style={{ color: 'var(--primary-light)' }}>{email}</strong>
                            </p>
                        </div>

                        <form onSubmit={handleVerifyOtp}>
                            <div className="form-group">
                                <label className="form-label" style={{ textAlign: 'center', display: 'block' }}>Enter OTP</label>
                                <div className="otp-inputs" onPaste={handlePaste} style={{ justifyContent: 'center', marginBottom: '24px' }}>
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={(el) => (inputRefs.current[idx] = el)}
                                            className="otp-digit"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(idx, e)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <button className="btn-primary" type="submit" style={{ marginTop: '16px' }}>
                                Verify OTP →
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ marginTop: '12px' }}
                                onClick={() => setStep(1)}
                            >
                                ← Back to Email
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
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <h2 className="auth-title">Set New Password</h2>
                            <p className="auth-subtitle">Create a new secure password for your account.</p>
                        </div>

                        <form onSubmit={handleResetPassword}>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <div className="input-wrapper">
                                    <Lock size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type={showPass ? 'text' : 'password'}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        autoFocus
                                    />
                                    <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={16} className="input-icon" />
                                    <input
                                        className="form-input"
                                        type={showConfirmPass ? 'text' : 'password'}
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" className="input-eye" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: '16px' }}>
                                {loading ? (
                                    <span className="flex flex-center gap-2">
                                        <span className="loading-dots"><span /><span /><span /></span> Resetting...
                                    </span>
                                ) : (
                                    'Reset Password →'
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                style={{ marginTop: '12px' }}
                                onClick={() => setStep(2)}
                                disabled={loading}
                            >
                                ← Back to OTP
                            </button>
                        </form>
                    </>
                )}

                <p className="auth-link" style={{ marginTop: '24px' }}>
                    Remember your password? <Link to="/login">Sign in here</Link>
                </p>
            </div>
        </div>
    );
}

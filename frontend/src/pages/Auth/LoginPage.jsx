import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Background Effects */}
            <div className="auth-bg-effects">
                <div className="auth-orb auth-orb-1"></div>
                <div className="auth-orb auth-orb-2"></div>
                <div className="auth-orb auth-orb-3"></div>
                <div className="auth-grid-pattern"></div>
            </div>

            <div className="auth-container">
                {/* Left Hero Panel */}
                <div className="auth-hero">
                    <div className="auth-hero-content">
                        <div className="auth-shield-icon">
                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32 4L8 16V32C8 46.36 18.64 59.48 32 62C45.36 59.48 56 46.36 56 32V16L32 4Z"
                                    fill="url(#shieldGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                                <path d="M28 38L22 32L24.82 29.18L28 32.34L39.18 21.18L42 24L28 38Z"
                                    fill="white" opacity="0.9" />
                                <defs>
                                    <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="62">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="50%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#a855f7" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1 className="auth-hero-title">KAVALAN</h1>
                        <p className="auth-hero-subtitle">Your Personal Safety Guardian</p>
                        <div className="auth-hero-features">
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🆘</span>
                                <span>Instant SOS Alerts</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">📍</span>
                                <span>Live Location Sharing</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🛡️</span>
                                <span>AI-Powered Protection</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">📞</span>
                                <span>Fake Call Escape</span>
                            </div>
                        </div>
                        <div className="auth-hero-stats">
                            <div className="auth-stat">
                                <span className="auth-stat-number">112</span>
                                <span className="auth-stat-label">Emergency</span>
                            </div>
                            <div className="auth-stat-divider"></div>
                            <div className="auth-stat">
                                <span className="auth-stat-number">1091</span>
                                <span className="auth-stat-label">Women Helpline</span>
                            </div>
                            <div className="auth-stat-divider"></div>
                            <div className="auth-stat">
                                <span className="auth-stat-number">24/7</span>
                                <span className="auth-stat-label">Protection</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Form Panel */}
                <div className="auth-form-panel">
                    <div className="auth-form-wrapper">
                        <div className="auth-form-header">
                            <div className="auth-mobile-logo">
                                <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16 2L4 8V16C4 23.18 9.32 29.74 16 31C22.68 29.74 28 23.18 28 16V8L16 2Z"
                                        fill="url(#mobileShieldGrad)" />
                                    <path d="M14 19L11 16L12.41 14.59L14 16.17L19.59 10.59L21 12L14 19Z" fill="white" />
                                    <defs>
                                        <linearGradient id="mobileShieldGrad" x1="4" y1="2" x2="28" y2="31">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#a855f7" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2 className="auth-form-title">Welcome Back</h2>
                            <p className="auth-form-description">
                                Sign in to continue your safety journey
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
                            {error && (
                                <div className="auth-error animate-fadeIn" id="login-error">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="auth-input-group">
                                <label htmlFor="login-identifier" className="auth-label">
                                    Email or Phone Number
                                </label>
                                <div className="auth-input-wrapper">
                                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>
                                    <input
                                        type="text"
                                        id="login-identifier"
                                        name="identifier"
                                        className="auth-input"
                                        placeholder="Enter your email or phone"
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            <div className="auth-input-group">
                                <label htmlFor="login-password" className="auth-label">
                                    Password
                                </label>
                                <div className="auth-input-wrapper">
                                    <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        id="login-password"
                                        name="password"
                                        className="auth-input"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label="Toggle password visibility"
                                    >
                                        {showPassword ? (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        ) : (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" stroke="currentColor" strokeWidth="1.5" />
                                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                                id="login-submit"
                            >
                                {loading ? (
                                    <div className="auth-spinner">
                                        <div className="auth-spinner-dot"></div>
                                        <div className="auth-spinner-dot"></div>
                                        <div className="auth-spinner-dot"></div>
                                    </div>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <div className="auth-divider">
                                <span>New to KAVALAN?</span>
                            </div>

                            <Link to="/register" className="auth-switch-btn" id="goto-register">
                                <span>Create Your Safety Account</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                    <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </Link>
                        </form>

                        <div className="auth-footer">
                            <p>India Emergency: <strong>112</strong> | Women Helpline: <strong>1091</strong></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

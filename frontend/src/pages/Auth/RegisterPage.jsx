import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const LANGUAGES = [
    'English', 'Tamil', 'Hindi', 'Telugu', 'Kannada',
    'Malayalam', 'Bengali', 'Marathi', 'Gujarati', 'Odia'
];

const REGIONS = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
    'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
    'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
    'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
    'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry',
    'Chandigarh', 'Andaman & Nicobar'
];

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirm_password: '',
        date_of_birth: '',
        region: '',
        preferred_language: 'English',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const validateStep1 = () => {
        if (!formData.full_name.trim()) {
            setError('Please enter your full name');
            return false;
        }
        if (!formData.email.trim() || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.phone.trim() || formData.phone.length < 10) {
            setError('Please enter a valid phone number (min 10 digits)');
            return false;
        }
        return true;
    };

    const validateStep2 = () => {
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (formData.password !== formData.confirm_password) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const goToStep2 = () => {
        if (validateStep1()) {
            setStep(2);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;

        setError('');
        setLoading(true);

        try {
            const { confirm_password, ...submitData } = formData;
            const result = await register(submitData);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.message);
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
                <div className="auth-hero auth-hero-register">
                    <div className="auth-hero-content">
                        <div className="auth-shield-icon">
                            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M32 4L8 16V32C8 46.36 18.64 59.48 32 62C45.36 59.48 56 46.36 56 32V16L32 4Z"
                                    fill="url(#shieldGrad2)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                                <path d="M32 16L22 21V29C22 36.18 26.32 42.74 32 44.5C37.68 42.74 42 36.18 42 29V21L32 16Z"
                                    fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
                                <path d="M30 34L26 30L27.41 28.59L30 31.17L36.59 24.59L38 26L30 34Z"
                                    fill="white" opacity="0.9" />
                                <defs>
                                    <linearGradient id="shieldGrad2" x1="8" y1="4" x2="56" y2="62">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="50%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <h1 className="auth-hero-title">Join KAVALAN</h1>
                        <p className="auth-hero-subtitle">Create your safety shield in minutes</p>
                        <div className="auth-hero-features">
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">✅</span>
                                <span>Free & Always Active</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🔒</span>
                                <span>End-to-End Encrypted</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">🌐</span>
                                <span>10 Indian Languages</span>
                            </div>
                            <div className="auth-feature-item">
                                <span className="auth-feature-icon">👨‍👩‍👧</span>
                                <span>Up to 10 Emergency Contacts</span>
                            </div>
                        </div>

                        {/* Step Indicator */}
                        <div className="auth-steps-indicator">
                            <div className={`auth-step-dot ${step >= 1 ? 'active' : ''}`}>
                                <span>1</span>
                                <label>Profile</label>
                            </div>
                            <div className={`auth-step-line ${step >= 2 ? 'active' : ''}`}></div>
                            <div className={`auth-step-dot ${step >= 2 ? 'active' : ''}`}>
                                <span>2</span>
                                <label>Security</label>
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
                                        fill="url(#mobileShieldGrad2)" />
                                    <path d="M14 19L11 16L12.41 14.59L14 16.17L19.59 10.59L21 12L14 19Z" fill="white" />
                                    <defs>
                                        <linearGradient id="mobileShieldGrad2" x1="4" y1="2" x2="28" y2="31">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <h2 className="auth-form-title">
                                {step === 1 ? 'Create Account' : 'Secure Your Account'}
                            </h2>
                            <p className="auth-form-description">
                                {step === 1
                                    ? 'Enter your personal details to get started'
                                    : 'Set your password and preferences'
                                }
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
                            {error && (
                                <div className="auth-error animate-fadeIn" id="register-error">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Step 1: Personal Details */}
                            {step === 1 && (
                                <div className="auth-step-content animate-fadeInUp">
                                    <div className="auth-input-group">
                                        <label htmlFor="reg-name" className="auth-label">Full Name</label>
                                        <div className="auth-input-wrapper">
                                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 21V19C20 17.94 19.58 16.92 18.83 16.17C18.08 15.42 17.06 15 16 15H8C6.94 15 5.92 15.42 5.17 16.17C4.42 16.92 4 17.94 4 19V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            <input
                                                type="text"
                                                id="reg-name"
                                                name="full_name"
                                                className="auth-input"
                                                placeholder="Enter your full name"
                                                value={formData.full_name}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-input-group">
                                        <label htmlFor="reg-email" className="auth-label">Email Address</label>
                                        <div className="auth-input-wrapper">
                                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M22 7L13.03 12.7C12.71 12.9 12.36 13 12 13C11.64 13 11.29 12.9 10.97 12.7L2 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                            <input
                                                type="email"
                                                id="reg-email"
                                                name="email"
                                                className="auth-input"
                                                placeholder="Enter your email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-input-group">
                                        <label htmlFor="reg-phone" className="auth-label">Phone Number</label>
                                        <div className="auth-input-wrapper">
                                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 16.92V19.92C22 20.48 21.47 21 20.92 21C10.4 20.4 2 12 1.04 3.08C1 2.53 1.52 2 2.08 2H5.08C5.56 2 5.97 2.35 6.04 2.82C6.28 4.68 6.82 6.49 7.62 8.16L5.39 10.39C7.08 14.12 9.88 16.92 13.61 18.61L15.84 16.38C17.51 17.18 19.32 17.72 21.18 17.96C21.65 18.03 22 18.44 22 18.92V16.92Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                            <input
                                                type="tel"
                                                id="reg-phone"
                                                name="phone"
                                                className="auth-input"
                                                placeholder="Enter 10-digit phone number"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-input-group">
                                        <label htmlFor="reg-dob" className="auth-label">Date of Birth</label>
                                        <div className="auth-input-wrapper">
                                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
                                            </svg>
                                            <input
                                                type="date"
                                                id="reg-dob"
                                                name="date_of_birth"
                                                className="auth-input"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="auth-submit-btn"
                                        onClick={goToStep2}
                                        id="reg-next-btn"
                                    >
                                        <span>Continue</span>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Password & Preferences */}
                            {step === 2 && (
                                <div className="auth-step-content animate-fadeInUp">
                                    <div className="auth-input-group">
                                        <label htmlFor="reg-password" className="auth-label">Password</label>
                                        <div className="auth-input-wrapper">
                                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="reg-password"
                                                name="password"
                                                className="auth-input"
                                                placeholder="Min 6 characters"
                                                value={formData.password}
                                                onChange={handleChange}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="auth-password-toggle"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? '🙈' : '👁️'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="auth-input-group">
                                        <label htmlFor="reg-confirm-password" className="auth-label">Confirm Password</label>
                                        <div className="auth-input-wrapper">
                                            <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
                                                <path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                <path d="M10 16L11.5 17.5L14.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                id="reg-confirm-password"
                                                name="confirm_password"
                                                className="auth-input"
                                                placeholder="Re-enter your password"
                                                value={formData.confirm_password}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="auth-input-row">
                                        <div className="auth-input-group">
                                            <label htmlFor="reg-region" className="auth-label">Region / State</label>
                                            <div className="auth-input-wrapper">
                                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="1.5" />
                                                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                                <select
                                                    id="reg-region"
                                                    name="region"
                                                    className="auth-input auth-select"
                                                    value={formData.region}
                                                    onChange={handleChange}
                                                >
                                                    <option value="">Select your state</option>
                                                    {REGIONS.map(r => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="auth-input-group">
                                            <label htmlFor="reg-language" className="auth-label">Language</label>
                                            <div className="auth-input-wrapper">
                                                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                                                    <path d="M2 12H22" stroke="currentColor" strokeWidth="1.5" />
                                                    <path d="M12 2C14.5 4.73 15.93 8.29 16 12C15.93 15.71 14.5 19.27 12 22C9.5 19.27 8.07 15.71 8 12C8.07 8.29 9.5 4.73 12 2Z" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                                <select
                                                    id="reg-language"
                                                    name="preferred_language"
                                                    className="auth-input auth-select"
                                                    value={formData.preferred_language}
                                                    onChange={handleChange}
                                                >
                                                    {LANGUAGES.map(lang => (
                                                        <option key={lang} value={lang}>{lang}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="auth-btn-row">
                                        <button
                                            type="button"
                                            className="auth-back-btn"
                                            onClick={() => { setStep(1); setError(''); }}
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                            <span>Back</span>
                                        </button>
                                        <button
                                            type="submit"
                                            className="auth-submit-btn auth-submit-grow"
                                            disabled={loading}
                                            id="register-submit"
                                        >
                                            {loading ? (
                                                <div className="auth-spinner">
                                                    <div className="auth-spinner-dot"></div>
                                                    <div className="auth-spinner-dot"></div>
                                                    <div className="auth-spinner-dot"></div>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>Create Account</span>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="auth-divider">
                                <span>Already have an account?</span>
                            </div>

                            <Link to="/login" className="auth-switch-btn" id="goto-login">
                                <span>Sign In Instead</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M15 3H19C19.53 3 20.04 3.21 20.41 3.59C20.79 3.96 21 4.47 21 5V19C21 19.53 20.79 20.04 20.41 20.41C20.04 20.79 19.53 21 19 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

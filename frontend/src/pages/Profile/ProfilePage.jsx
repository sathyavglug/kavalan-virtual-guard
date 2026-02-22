import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../services/api';
import './Profile.css';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const languages = ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Odia'];
    const regions = [
        'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana',
        'Maharashtra', 'West Bengal', 'Gujarat', 'Rajasthan', 'Odisha',
        'Uttar Pradesh', 'Madhya Pradesh', 'Delhi', 'Punjab', 'Haryana',
        'Bihar', 'Jharkhand', 'Assam', 'Goa', 'Other'
    ];

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const res = await profileAPI.getProfile();
            if (res.data.success) {
                setProfile(res.data.user);
                setFormData({
                    full_name: res.data.user.full_name || '',
                    phone: res.data.user.phone || '',
                    date_of_birth: res.data.user.date_of_birth || '',
                    region: res.data.user.region || '',
                    preferred_language: res.data.user.preferred_language || 'English',
                });
            }
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const res = await profileAPI.updateProfile(formData);
            setSuccess(res.data.message);
            setEditMode(false);
            loadProfile();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('Passwords do not match');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const res = await profileAPI.changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            setSuccess(res.data.message);
            setShowPasswordModal(false);
            setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetHomeLocation = async () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const res = await profileAPI.updateHomeLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setSuccess(res.data.message);
                    loadProfile();
                } catch (err) {
                    setError('Failed to save home location');
                }
            },
            () => setError('Unable to get your location. Please allow location access.')
        );
    };

    const getAge = (dob) => {
        if (!dob) return null;
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
    };

    const getMemberSince = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="profile-loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    const age = getAge(profile?.date_of_birth);

    return (
        <div className="profile-page">
            {error && (
                <div className="profile-alert profile-alert-error animate-fadeInUp">
                    ⚠️ {error}
                    <button onClick={() => setError('')} className="alert-close">✕</button>
                </div>
            )}
            {success && (
                <div className="profile-alert profile-alert-success animate-fadeInUp">
                    ✅ {success}
                    <button onClick={() => setSuccess('')} className="alert-close">✕</button>
                </div>
            )}

            {/* Profile Header Card */}
            <div className="profile-header-card glass-card animate-fadeInUp">
                <div className="profile-avatar-section">
                    <div className="profile-avatar-large">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'K'}
                    </div>
                    <div className="profile-verified-badge">
                        {profile?.is_verified ? '✅ Verified' : '⏳ Unverified'}
                    </div>
                </div>
                <div className="profile-header-info">
                    <h1>{profile?.full_name}</h1>
                    <p className="profile-email">{profile?.email}</p>
                    <p className="profile-phone">📱 {profile?.phone}</p>
                    <div className="profile-stats">
                        <div className="profile-stat">
                            <span className="stat-value">{profile?.emergency_contacts_count || 0}</span>
                            <span className="stat-label">Contacts</span>
                        </div>
                        <div className="profile-stat">
                            <span className="stat-value">{profile?.sos_alerts_count || 0}</span>
                            <span className="stat-label">SOS Alerts</span>
                        </div>
                        <div className="profile-stat">
                            <span className="stat-value">{getMemberSince(profile?.created_at)}</span>
                            <span className="stat-label">Member Since</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Details */}
            <div className="profile-sections">
                <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                    <div className="profile-section-header">
                        <h2>👤 Personal Information</h2>
                        <button onClick={() => setEditMode(!editMode)} className="profile-edit-btn">
                            {editMode ? 'Cancel' : '✏️ Edit'}
                        </button>
                    </div>

                    {editMode ? (
                        <form onSubmit={handleSaveProfile} className="profile-form">
                            <div className="profile-form-grid">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="tel" value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth</label>
                                    <input type="date" value={formData.date_of_birth}
                                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label>Region</label>
                                    <select value={formData.region}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}>
                                        <option value="">Select region</option>
                                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Preferred Language</label>
                                    <select value={formData.preferred_language}
                                        onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}>
                                        {languages.map(l => <option key={l} value={l}>{l}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} className="btn-primary" style={{ marginTop: '16px' }}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    ) : (
                        <div className="profile-details-grid">
                            <div className="profile-detail-item">
                                <span className="detail-label">Full Name</span>
                                <span className="detail-value">{profile?.full_name}</span>
                            </div>
                            <div className="profile-detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{profile?.email}</span>
                            </div>
                            <div className="profile-detail-item">
                                <span className="detail-label">Phone</span>
                                <span className="detail-value">{profile?.phone}</span>
                            </div>
                            <div className="profile-detail-item">
                                <span className="detail-label">Date of Birth</span>
                                <span className="detail-value">{profile?.date_of_birth || 'Not set'}</span>
                            </div>
                            {age !== null && (
                                <div className="profile-detail-item">
                                    <span className="detail-label">Age</span>
                                    <span className="detail-value">{age} years</span>
                                </div>
                            )}
                            <div className="profile-detail-item">
                                <span className="detail-label">Region</span>
                                <span className="detail-value">{profile?.region || 'Not set'}</span>
                            </div>
                            <div className="profile-detail-item">
                                <span className="detail-label">Language</span>
                                <span className="detail-value">{profile?.preferred_language}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Home Location */}
                <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                    <h2>🏠 Home Location (Geofence)</h2>
                    <p className="profile-section-desc">
                        Set your home location to enable geofence alerts when you leave home.
                    </p>
                    {profile?.home_latitude && profile?.home_longitude ? (
                        <div className="profile-location-set">
                            <div className="location-coords">
                                <span>📍 {profile.home_latitude.toFixed(6)}, {profile.home_longitude.toFixed(6)}</span>
                            </div>
                            <button onClick={handleSetHomeLocation} className="btn-secondary">Update Location</button>
                        </div>
                    ) : (
                        <button onClick={handleSetHomeLocation} className="btn-primary">
                            📍 Set My Home Location
                        </button>
                    )}
                </div>

                {/* Security */}
                <div className="profile-section glass-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                    <h2>🔒 Security</h2>
                    <div className="profile-security-actions">
                        <button onClick={() => setShowPasswordModal(true)} className="profile-security-btn">
                            <div className="security-btn-icon">🔑</div>
                            <div className="security-btn-text">
                                <span className="security-btn-title">Change Password</span>
                                <span className="security-btn-desc">Update your account password</span>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                        <button onClick={logout} className="profile-security-btn profile-danger-btn">
                            <div className="security-btn-icon">🚪</div>
                            <div className="security-btn-text">
                                <span className="security-btn-title">Logout</span>
                                <span className="security-btn-desc">Sign out of your account</span>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="contacts-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}>
                    <div className="contacts-modal glass-card animate-fadeInUp">
                        <div className="contacts-modal-header">
                            <h2>🔑 Change Password</h2>
                            <button onClick={() => setShowPasswordModal(false)} className="modal-close-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleChangePassword} className="contacts-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input type="password" value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    required />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input type="password" value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    required minLength={6} />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    required minLength={6} />
                            </div>
                            <div className="form-actions">
                                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">Cancel</button>
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Changing...' : 'Change Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

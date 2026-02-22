import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { settingsAPI } from '../../services/api';
import './Settings.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const res = await settingsAPI.getSettings();
            if (res.data.success) {
                setSettings(res.data.settings);
            }
        } catch (err) {
            // Use defaults if backend is unavailable
            setSettings({
                sos_sound_enabled: true,
                sos_vibration_enabled: true,
                auto_location_sharing: true,
                shake_to_sos: false,
                floating_bubble_enabled: false,
                notification_sound: 'default',
                theme: 'dark',
                font_size: 'medium',
                auto_recording: false,
                geofence_alerts: true,
                check_in_reminders: false,
                check_in_interval_minutes: 30,
            });
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key, value) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        setSaving(true);
        try {
            await settingsAPI.updateSettings({ [key]: value });
            setSuccess('Setting updated ✅');
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to save setting');
            setTimeout(() => setError(''), 3000);
        } finally {
            setSaving(false);
        }
    };

    const handleResetSettings = async () => {
        if (!window.confirm('Reset all settings to default?')) return;
        try {
            await settingsAPI.resetSettings();
            setSuccess('Settings reset to default! ⚙️');
            loadSettings();
        } catch (err) {
            setError('Failed to reset settings');
        }
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <div className="settings-loading-spinner"></div>
                <p>Loading settings...</p>
            </div>
        );
    }

    const ToggleSwitch = ({ value, onChange, label, description, icon }) => (
        <div className="settings-item">
            <div className="settings-item-info">
                <span className="settings-item-icon">{icon}</span>
                <div className="settings-item-text">
                    <span className="settings-item-label">{label}</span>
                    <span className="settings-item-desc">{description}</span>
                </div>
            </div>
            <button
                className={`settings-toggle ${value ? 'settings-toggle-on' : ''}`}
                onClick={() => onChange(!value)}
                id={`toggle-${label.toLowerCase().replace(/\s/g, '-')}`}
            >
                <span className="settings-toggle-thumb"></span>
            </button>
        </div>
    );

    return (
        <div className="settings-page">
            {error && (
                <div className="settings-toast settings-toast-error animate-fadeInUp">
                    ⚠️ {error}
                </div>
            )}
            {success && (
                <div className="settings-toast settings-toast-success animate-fadeInUp">
                    {success}
                </div>
            )}

            <div className="settings-header">
                <h1>⚙️ Settings</h1>
                <p>Configure your KAVALAN safety preferences</p>
            </div>

            {/* SOS Settings */}
            <div className="settings-section glass-card animate-fadeInUp">
                <h2 className="settings-section-title">
                    <span className="section-icon">🆘</span>
                    SOS Configuration
                </h2>

                <ToggleSwitch
                    value={settings.sos_sound_enabled}
                    onChange={(v) => updateSetting('sos_sound_enabled', v)}
                    label="SOS Alert Sound"
                    description="Play alarm sound when SOS is triggered"
                    icon="🔊"
                />

                <ToggleSwitch
                    value={settings.sos_vibration_enabled}
                    onChange={(v) => updateSetting('sos_vibration_enabled', v)}
                    label="SOS Vibration"
                    description="Vibrate device during SOS alert"
                    icon="📳"
                />

                <ToggleSwitch
                    value={settings.shake_to_sos}
                    onChange={(v) => updateSetting('shake_to_sos', v)}
                    label="Shake to SOS"
                    description="Shake your phone vigorously to trigger SOS"
                    icon="📱"
                />

                <ToggleSwitch
                    value={settings.auto_recording}
                    onChange={(v) => updateSetting('auto_recording', v)}
                    label="Auto Audio Recording"
                    description="Automatically start recording when SOS triggers"
                    icon="🎤"
                />
            </div>

            {/* Location Settings */}
            <div className="settings-section glass-card animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <h2 className="settings-section-title">
                    <span className="section-icon">📍</span>
                    Location & Safety
                </h2>

                <ToggleSwitch
                    value={settings.auto_location_sharing}
                    onChange={(v) => updateSetting('auto_location_sharing', v)}
                    label="Auto Location Sharing"
                    description="Automatically share location with SOS alert"
                    icon="📡"
                />

                <ToggleSwitch
                    value={settings.geofence_alerts}
                    onChange={(v) => updateSetting('geofence_alerts', v)}
                    label="Geofence Alerts"
                    description="Get alerts when leaving your home zone"
                    icon="🏠"
                />

                <ToggleSwitch
                    value={settings.floating_bubble_enabled}
                    onChange={(v) => updateSetting('floating_bubble_enabled', v)}
                    label="Floating SOS Bubble"
                    description="Show SOS button floating on screen edge"
                    icon="🫧"
                />

                <ToggleSwitch
                    value={settings.check_in_reminders}
                    onChange={(v) => updateSetting('check_in_reminders', v)}
                    label="Check-in Reminders"
                    description="Remind you to check-in when you're outside"
                    icon="⏰"
                />

                {settings.check_in_reminders && (
                    <div className="settings-item settings-sub-item animate-fadeIn">
                        <div className="settings-item-info">
                            <span className="settings-item-icon">🕐</span>
                            <div className="settings-item-text">
                                <span className="settings-item-label">Check-in Interval</span>
                                <span className="settings-item-desc">How often to remind you</span>
                            </div>
                        </div>
                        <select
                            value={settings.check_in_interval_minutes}
                            onChange={(e) => updateSetting('check_in_interval_minutes', parseInt(e.target.value))}
                            className="settings-select"
                        >
                            <option value={15}>15 min</option>
                            <option value={30}>30 min</option>
                            <option value={60}>1 hour</option>
                            <option value={120}>2 hours</option>
                        </select>
                    </div>
                )}
            </div>

            {/* Appearance Settings */}
            <div className="settings-section glass-card animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                <h2 className="settings-section-title">
                    <span className="section-icon">🎨</span>
                    Appearance
                </h2>

                <div className="settings-item">
                    <div className="settings-item-info">
                        <span className="settings-item-icon">🌙</span>
                        <div className="settings-item-text">
                            <span className="settings-item-label">Theme</span>
                            <span className="settings-item-desc">App color theme</span>
                        </div>
                    </div>
                    <div className="settings-theme-options">
                        {['dark', 'light', 'auto'].map(t => (
                            <button
                                key={t}
                                className={`settings-theme-btn ${settings.theme === t ? 'active' : ''}`}
                                onClick={() => updateSetting('theme', t)}
                            >
                                {t === 'dark' && '🌙'}
                                {t === 'light' && '☀️'}
                                {t === 'auto' && '🔄'}
                                <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="settings-item">
                    <div className="settings-item-info">
                        <span className="settings-item-icon">🔤</span>
                        <div className="settings-item-text">
                            <span className="settings-item-label">Font Size</span>
                            <span className="settings-item-desc">Text display size</span>
                        </div>
                    </div>
                    <div className="settings-font-options">
                        {['small', 'medium', 'large'].map(s => (
                            <button
                                key={s}
                                className={`settings-font-btn ${settings.font_size === s ? 'active' : ''}`}
                                onClick={() => updateSetting('font_size', s)}
                            >
                                <span className={`font-preview font-${s}`}>A</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="settings-item">
                    <div className="settings-item-info">
                        <span className="settings-item-icon">🔔</span>
                        <div className="settings-item-text">
                            <span className="settings-item-label">Notification Sound</span>
                            <span className="settings-item-desc">Alert notification tone</span>
                        </div>
                    </div>
                    <select
                        value={settings.notification_sound}
                        onChange={(e) => updateSetting('notification_sound', e.target.value)}
                        className="settings-select"
                    >
                        <option value="default">Default</option>
                        <option value="urgent">Urgent</option>
                        <option value="gentle">Gentle</option>
                        <option value="silent">Silent</option>
                    </select>
                </div>
            </div>

            {/* About & Info */}
            <div className="settings-section glass-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <h2 className="settings-section-title">
                    <span className="section-icon">ℹ️</span>
                    About KAVALAN
                </h2>

                <div className="settings-about">
                    <div className="settings-about-logo">
                        <svg viewBox="0 0 64 64" width="48" height="48" fill="none">
                            <path d="M32 4L8 16V32C8 46.36 18.64 59.48 32 62C45.36 59.48 56 46.36 56 32V16L32 4Z"
                                fill="url(#aboutShield)" fillOpacity="0.3" stroke="url(#aboutStroke)" strokeWidth="1.5" />
                            <path d="M28 38L22 32L24.82 29.18L28 32.34L39.18 21.18L42 24L28 38Z" fill="#6366f1" />
                            <defs>
                                <linearGradient id="aboutShield" x1="8" y1="4" x2="56" y2="62">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                                <linearGradient id="aboutStroke" x1="8" y1="4" x2="56" y2="62">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <div className="settings-about-info">
                        <h3>KAVALAN</h3>
                        <p className="settings-about-version">Version 1.0.0</p>
                        <p className="settings-about-tagline">Your Personal Safety Guardian</p>
                    </div>
                </div>

                <div className="settings-info-grid">
                    <div className="settings-info-item">
                        <span className="info-label">Emergency</span>
                        <a href="tel:112" className="info-value info-value-link">📞 112</a>
                    </div>
                    <div className="settings-info-item">
                        <span className="info-label">Women Helpline</span>
                        <a href="tel:1091" className="info-value info-value-link">📞 1091</a>
                    </div>
                    <div className="settings-info-item">
                        <span className="info-label">Police</span>
                        <a href="tel:100" className="info-value info-value-link">📞 100</a>
                    </div>
                    <div className="settings-info-item">
                        <span className="info-label">Ambulance</span>
                        <a href="tel:108" className="info-value info-value-link">📞 108</a>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="settings-section settings-danger-section glass-card animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
                <h2 className="settings-section-title">
                    <span className="section-icon">⚠️</span>
                    Advanced
                </h2>

                <button onClick={handleResetSettings} className="settings-action-btn settings-reset-btn" id="reset-settings-btn">
                    <span className="settings-action-icon">🔄</span>
                    <div className="settings-action-text">
                        <span className="settings-action-title">Reset All Settings</span>
                        <span className="settings-action-desc">Restore all settings to default values</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                <button onClick={logout} className="settings-action-btn settings-logout-btn" id="settings-logout-btn">
                    <span className="settings-action-icon">🚪</span>
                    <div className="settings-action-text">
                        <span className="settings-action-title">Logout</span>
                        <span className="settings-action-desc">Sign out of your account</span>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>

            {saving && <div className="settings-saving-indicator">Saving...</div>}
        </div>
    );
}

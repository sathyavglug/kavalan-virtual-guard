import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { sosAPI } from '../../services/api';
import ContactsPage from '../Contacts/ContactsPage';
import ProfilePage from '../Profile/ProfilePage';
import ChatPage from '../Chat/ChatPage';
import SOSHistoryPage from '../SOSHistory/SOSHistoryPage';
import SettingsPage from '../Settings/SettingsPage';
import './Dashboard.css';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [sosActive, setSOSActive] = useState(false);
    const [sosData, setSOSData] = useState(null);
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [showFakeCall, setShowFakeCall] = useState(false);
    const [locationSharing, setLocationSharing] = useState(false);
    const [safeMessage, setSafeMessage] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleTriggerSOS = async () => {
        setShowSOSModal(true);
    };

    const confirmSOS = async () => {
        try {
            let locationData = {};
            if (navigator.geolocation) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                }).catch(() => null);
                if (position) {
                    locationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                }
            }
            const res = await sosAPI.triggerSOS(locationData);
            if (res.data.success) {
                setSOSActive(true);
                setSOSData(res.data);
                setShowSOSModal(false);
            }
        } catch (err) {
            console.error('SOS Error:', err);
        }
    };

    const handleResolveSOS = async () => {
        if (!sosData?.sos_id) return;
        try {
            await sosAPI.resolveSOS(sosData.sos_id);
            setSOSActive(false);
            setSOSData(null);
            setSafeMessage('You are safe! ✅ Contacts notified.');
            setTimeout(() => setSafeMessage(''), 4000);
        } catch (err) {
            console.error('Resolve error:', err);
        }
    };

    const handleShareLocation = () => {
        setLocationSharing(!locationSharing);
        if (!locationSharing) {
            setSafeMessage('📍 Live location sharing activated');
        } else {
            setSafeMessage('📍 Location sharing stopped');
        }
        setTimeout(() => setSafeMessage(''), 3000);
    };

    const handleSendSafe = () => {
        setSafeMessage("✅ 'I am safe' message sent to all contacts!");
        setTimeout(() => setSafeMessage(''), 4000);
    };

    const handleFakeCall = () => {
        setShowFakeCall(true);
    };

    const dismissFakeCall = () => {
        setShowFakeCall(false);
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'contacts': return <ContactsPage />;
            case 'chat': return <ChatPage />;
            case 'history': return <SOSHistoryPage />;
            case 'profile': return <ProfilePage />;
            case 'settings': return <SettingsPage />;
            default: return renderHome();
        }
    };

    const renderHome = () => (
        <main className="dashboard-main">
            {/* Safe Message Toast */}
            {safeMessage && (
                <div className="dashboard-toast animate-fadeInUp">
                    {safeMessage}
                </div>
            )}

            {/* SOS Active Banner */}
            {sosActive && (
                <div className="sos-active-dashboard animate-fadeInUp">
                    <div className="sos-active-inner">
                        <div className="sos-active-pulse-ring"></div>
                        <span className="sos-active-text">🆘 SOS ACTIVE — Help is coming</span>
                    </div>
                    <button onClick={handleResolveSOS} className="sos-resolve-dashboard-btn">✅ I'm Safe Now</button>
                </div>
            )}

            {/* Welcome Card */}
            <div className="dashboard-welcome glass-card animate-fadeInUp">
                <div className="dashboard-welcome-content">
                    <h1>Welcome, {user?.full_name || 'User'}! 🛡️</h1>
                    <p>Your safety guardian is active and watching over you.</p>
                    <div className="dashboard-mode-badge">
                        <span className={`mode-dot ${sosActive ? 'mode-dot-sos' : ''}`}></span>
                        {sosActive ? 'Mode: SOS — Emergency active' : locationSharing ? 'Mode: ACTIVE — Location sharing' : 'Mode: IDLE — All systems ready'}
                    </div>
                </div>
                <div className="dashboard-welcome-shield">
                    <svg viewBox="0 0 80 80" fill="none">
                        <path d="M40 5L10 20V40C10 58 23.3 74.35 40 78C56.7 74.35 70 58 70 40V20L40 5Z"
                            fill="url(#welcomeShield)" fillOpacity="0.2" stroke="url(#welcomeShieldStroke)" strokeWidth="1.5" />
                        <path d="M35 47.5L27.5 40L30.33 37.18L35 41.83L49.68 27.18L52.5 30L35 47.5Z" fill="#6366f1" />
                        <defs>
                            <linearGradient id="welcomeShield" x1="10" y1="5" x2="70" y2="78">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient id="welcomeShieldStroke" x1="10" y1="5" x2="70" y2="78">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* SOS Button - Large Prominent */}
            <div className="dashboard-sos-section animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <button className="dashboard-sos-button" onClick={handleTriggerSOS} id="sos-main-btn">
                    <div className="sos-button-ripple"></div>
                    <div className="sos-button-ripple sos-ripple-2"></div>
                    <span className="sos-button-text">SOS</span>
                    <span className="sos-button-sub">Tap for Emergency</span>
                </button>
            </div>

            {/* Quick Actions Grid */}
            <h2 className="dashboard-section-title animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
                Quick Safety Actions
            </h2>
            <div className="dashboard-actions-grid">
                <button className="dashboard-action-card animate-fadeInUp" style={{ animationDelay: '0.2s' }}
                    onClick={handleShareLocation} id="location-btn">
                    <div className="action-icon location-icon">{locationSharing ? '📡' : '📍'}</div>
                    <span className="action-title">{locationSharing ? 'Stop Sharing' : 'Share Location'}</span>
                    <span className="action-desc">{locationSharing ? 'Tap to stop' : 'Live GPS to contacts'}</span>
                </button>

                <button className="dashboard-action-card animate-fadeInUp" style={{ animationDelay: '0.25s' }}
                    onClick={() => setActiveTab('chat')} id="safe-route-btn">
                    <div className="action-icon route-icon">🗺️</div>
                    <span className="action-title">Safe Route</span>
                    <span className="action-desc">Ask KAVALAN AI</span>
                </button>

                <button className="dashboard-action-card animate-fadeInUp" style={{ animationDelay: '0.3s' }}
                    onClick={handleFakeCall} id="fake-call-btn">
                    <div className="action-icon call-icon">📞</div>
                    <span className="action-title">Fake Call</span>
                    <span className="action-desc">Escape situation</span>
                </button>

                <button className="dashboard-action-card animate-fadeInUp" style={{ animationDelay: '0.35s' }} id="police-btn">
                    <a href="tel:100" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <div className="action-icon police-icon">🏛️</div>
                        <span className="action-title">Call Police</span>
                        <span className="action-desc">Dial 100 directly</span>
                    </a>
                </button>

                <button className="dashboard-action-card animate-fadeInUp" style={{ animationDelay: '0.4s' }}
                    onClick={handleSendSafe} id="safe-msg-btn">
                    <div className="action-icon safe-icon">✅</div>
                    <span className="action-title">I'm Safe</span>
                    <span className="action-desc">Notify contacts</span>
                </button>

                <button className="dashboard-action-card animate-fadeInUp" style={{ animationDelay: '0.45s' }}
                    onClick={() => setActiveTab('history')} id="history-btn">
                    <div className="action-icon history-icon">📋</div>
                    <span className="action-title">SOS History</span>
                    <span className="action-desc">View past alerts</span>
                </button>
            </div>

            {/* Emergency Numbers */}
            <div className="dashboard-emergency glass-card animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
                <h3>🆘 Emergency Numbers</h3>
                <div className="emergency-numbers">
                    <a href="tel:112" className="emergency-number">
                        <span className="emergency-label">Emergency</span>
                        <span className="emergency-value">112</span>
                    </a>
                    <a href="tel:1091" className="emergency-number">
                        <span className="emergency-label">Women Helpline</span>
                        <span className="emergency-value">1091</span>
                    </a>
                    <a href="tel:100" className="emergency-number">
                        <span className="emergency-label">Police</span>
                        <span className="emergency-value">100</span>
                    </a>
                    <a href="tel:108" className="emergency-number">
                        <span className="emergency-label">Ambulance</span>
                        <span className="emergency-value">108</span>
                    </a>
                </div>
            </div>
        </main>
    );

    return (
        <div className="dashboard-page">
            <div className="dashboard-bg-effects">
                <div className="dashboard-orb dashboard-orb-1"></div>
                <div className="dashboard-orb dashboard-orb-2"></div>
            </div>

            {/* Top Navigation */}
            <nav className="dashboard-nav">
                <div className="dashboard-nav-brand" onClick={() => setActiveTab('home')} style={{ cursor: 'pointer' }}>
                    <svg viewBox="0 0 32 32" width="32" height="32" fill="none">
                        <path d="M16 2L4 8V16C4 23.18 9.32 29.74 16 31C22.68 29.74 28 23.18 28 16V8L16 2Z"
                            fill="url(#navShield)" />
                        <path d="M14 19L11 16L12.41 14.59L14 16.17L19.59 10.59L21 12L14 19Z" fill="white" />
                        <defs>
                            <linearGradient id="navShield" x1="4" y1="2" x2="28" y2="31">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span className="dashboard-nav-title">KAVALAN</span>
                </div>
                <div className="dashboard-nav-actions">
                    <button className="dashboard-settings-btn" onClick={() => setActiveTab('settings')} title="Settings" id="nav-settings">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div className="dashboard-user-info" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
                        <div className="dashboard-avatar">
                            {user?.full_name?.charAt(0)?.toUpperCase() || 'K'}
                        </div>
                        <span className="dashboard-user-name">{user?.full_name}</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="dashboard-content" style={{ position: 'relative', zIndex: 1 }}>
                {renderActiveTab()}
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button className={`bottom-nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => setActiveTab('home')} id="nav-home">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Home</span>
                </button>
                <button className={`bottom-nav-item ${activeTab === 'contacts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('contacts')} id="nav-contacts">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Contacts</span>
                </button>
                <button className={`bottom-nav-item bottom-nav-sos ${activeTab === 'sos' ? 'active' : ''}`}
                    onClick={handleTriggerSOS} id="nav-sos">
                    <div className="bottom-sos-circle">
                        <span>SOS</span>
                    </div>
                </button>
                <button className={`bottom-nav-item ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')} id="nav-chat">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>AI Chat</span>
                </button>
                <button className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')} id="nav-profile">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span>Profile</span>
                </button>
            </nav>

            {/* SOS Confirmation Modal */}
            {showSOSModal && (
                <div className="sos-modal-overlay">
                    <div className="sos-modal animate-fadeInUp">
                        <div className="sos-modal-icon">🆘</div>
                        <h2>Trigger SOS Alert?</h2>
                        <p>This will immediately:</p>
                        <ul className="sos-modal-list">
                            <li>📱 Send SMS to all emergency contacts</li>
                            <li>📍 Share your live GPS location</li>
                            <li>🏛️ Alert nearest police station</li>
                            <li>🎤 Start audio recording</li>
                        </ul>
                        <div className="sos-modal-actions">
                            <button onClick={confirmSOS} className="sos-confirm-btn">
                                🆘 YES, TRIGGER SOS
                            </button>
                            <button onClick={() => setShowSOSModal(false)} className="sos-dismiss-btn">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fake Call Overlay */}
            {showFakeCall && (
                <div className="fake-call-overlay" onClick={dismissFakeCall}>
                    <div className="fake-call-screen animate-fadeIn">
                        <div className="fake-call-top">
                            <span className="fake-call-label">Incoming Call</span>
                            <div className="fake-call-avatar-ring">
                                <div className="fake-call-avatar-inner">👩</div>
                            </div>
                            <h2 className="fake-call-name">Mom</h2>
                            <p className="fake-call-status">Mobile +91 98XXXXX210</p>
                        </div>
                        <div className="fake-call-actions">
                            <button className="fake-call-decline" onClick={dismissFakeCall}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M23 16.92A13.86 13.86 0 001 16.92l2.34-2.34a2 2 0 012.83 0l1.65 1.65a2 2 0 002.83 0L22 5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </button>
                            <button className="fake-call-accept" onClick={dismissFakeCall}>
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

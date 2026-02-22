import { useState, useEffect } from 'react';
import { sosAPI } from '../../services/api';
import './SOSHistory.css';

export default function SOSHistoryPage() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeAlert, setActiveAlert] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadHistory();
        checkActiveAlert();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await sosAPI.getHistory();
            if (res.data.success) setHistory(res.data.history);
        } catch (err) {
            setError('Failed to load SOS history');
        } finally {
            setLoading(false);
        }
    };

    const checkActiveAlert = async () => {
        try {
            const res = await sosAPI.getActiveSOS();
            if (res.data.success && res.data.has_active_sos) {
                setActiveAlert(res.data.active_sos);
            }
        } catch (err) {
            console.error('Failed to check active SOS:', err);
        }
    };

    const handleResolve = async () => {
        if (!activeAlert) return;
        try {
            const res = await sosAPI.resolveSOS(activeAlert.id);
            setSuccess(res.data.message);
            setActiveAlert(null);
            loadHistory();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resolve alert');
        }
    };

    const handleCancel = async () => {
        if (!activeAlert) return;
        if (!window.confirm('Are you sure you want to cancel this SOS alert?')) return;
        try {
            const res = await sosAPI.cancelSOS(activeAlert.id);
            setSuccess(res.data.message);
            setActiveAlert(null);
            loadHistory();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cancel alert');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const statusConfig = {
        ACTIVE: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.25)', icon: '🔴', label: 'Active' },
        RESOLVED: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.25)', icon: '✅', label: 'Resolved' },
        CANCELLED: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', border: 'rgba(148, 163, 184, 0.25)', icon: '⚪', label: 'Cancelled' },
    };

    if (loading) {
        return (
            <div className="sos-loading">
                <div className="sos-loading-spinner"></div>
                <p>Loading SOS history...</p>
            </div>
        );
    }

    return (
        <div className="sos-history-page">
            <div className="sos-history-header">
                <h1>🔔 SOS Alert History</h1>
                <p>Track all your emergency alerts and their status</p>
            </div>

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

            {/* Active Alert Banner */}
            {activeAlert && (
                <div className="sos-active-banner animate-fadeInUp">
                    <div className="sos-active-content">
                        <div className="sos-active-icon">
                            <div className="sos-pulse-ring"></div>
                            <span>🆘</span>
                        </div>
                        <div>
                            <h3>Active SOS Alert</h3>
                            <p>Triggered at {formatDate(activeAlert.triggered_at)}</p>
                        </div>
                    </div>
                    <div className="sos-active-actions">
                        <button onClick={handleResolve} className="sos-resolve-btn">✅ I'm Safe</button>
                        <button onClick={handleCancel} className="sos-cancel-btn">Cancel Alert</button>
                    </div>
                </div>
            )}

            {/* History List */}
            {history.length > 0 ? (
                <div className="sos-history-list">
                    {history.map((log, index) => {
                        const config = statusConfig[log.status] || statusConfig.CANCELLED;
                        return (
                            <div key={log.id} className="sos-history-item glass-card animate-fadeInUp"
                                style={{ animationDelay: `${index * 0.05}s` }}>
                                <div className="sos-history-item-left">
                                    <div className="sos-history-status-icon" style={{ background: config.bg, borderColor: config.border }}>
                                        {config.icon}
                                    </div>
                                    <div className="sos-history-item-info">
                                        <span className="sos-history-date">{formatDate(log.triggered_at)}</span>
                                        <span className="sos-history-status-badge" style={{ color: config.color, background: config.bg, borderColor: config.border }}>
                                            {config.label}
                                        </span>
                                        {log.resolved_at && (
                                            <span className="sos-history-resolved">Resolved: {formatDate(log.resolved_at)}</span>
                                        )}
                                    </div>
                                </div>
                                {log.latitude && log.longitude && (
                                    <div className="sos-history-location">
                                        📍 {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="sos-empty animate-fadeInUp">
                    <div className="sos-empty-icon">🛡️</div>
                    <h3>No SOS Alerts</h3>
                    <p>You haven't triggered any SOS alerts yet. Stay safe!</p>
                </div>
            )}
        </div>
    );
}

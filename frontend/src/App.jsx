import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import Dashboard from './pages/Dashboard/Dashboard';
import SplashScreen from './pages/Splash/SplashScreen';
import './App.css';

function ProtectedRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) {
        return (
            <div className="app-loading">
                <div className="app-loading-shield">
                    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32 4L8 16V32C8 46.36 18.64 59.48 32 62C45.36 59.48 56 46.36 56 32V16L32 4Z"
                            fill="url(#loadShield)" fillOpacity="0.3" stroke="url(#loadShieldStroke)" strokeWidth="1.5" />
                        <path d="M28 38L22 32L24.82 29.18L28 32.34L39.18 21.18L42 24L28 38Z" fill="#6366f1" />
                        <defs>
                            <linearGradient id="loadShield" x1="8" y1="4" x2="56" y2="62">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                            <linearGradient id="loadShieldStroke" x1="8" y1="4" x2="56" y2="62">
                                <stop offset="0%" stopColor="#818cf8" />
                                <stop offset="100%" stopColor="#c084fc" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <p className="app-loading-text">KAVALAN</p>
                <div className="app-loading-bar">
                    <div className="app-loading-bar-fill"></div>
                </div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function PublicRoute({ children }) {
    const { token, loading } = useAuth();

    if (loading) return null;

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

function AppContent() {
    const [showSplash, setShowSplash] = useState(true);

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <Routes>
            <Route path="/login" element={
                <PublicRoute><LoginPage /></PublicRoute>
            } />
            <Route path="/register" element={
                <PublicRoute><RegisterPage /></PublicRoute>
            } />
            <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;

import { useState, useEffect } from 'react';
import './Splash.css';

export default function SplashScreen({ onFinish }) {
    const [phase, setPhase] = useState('logo'); // logo -> text -> finish

    useEffect(() => {
        // Logo animation time
        const logoTimer = setTimeout(() => {
            setPhase('text');
        }, 2000);

        // Finish splash time
        const finishTimer = setTimeout(() => {
            onFinish();
        }, 4000);

        return () => {
            clearTimeout(logoTimer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div className="splash-screen">
            <div className="splash-background">
                <div className="splash-orb splash-orb-1"></div>
                <div className="splash-orb splash-orb-2"></div>
            </div>

            <div className="splash-container">
                <div className={`splash-logo-wrapper ${phase === 'text' ? 'phase-text' : ''}`}>
                    <div className="splash-shield">
                        <svg viewBox="0 0 64 64" width="120" height="120" fill="none">
                            <path d="M32 4L8 16V32C8 46.36 18.64 59.48 32 62C45.36 59.48 56 46.36 56 32V16L32 4Z"
                                fill="url(#splashShieldGrad)" stroke="url(#splashShieldStroke)" strokeWidth="2" />
                            <path d="M28 38L22 32L24.82 29.18L28 32.34L39.18 21.18L42 24L28 38Z" fill="white" />
                            <defs>
                                <linearGradient id="splashShieldGrad" x1="8" y1="4" x2="56" y2="62">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                                <linearGradient id="splashShieldStroke" x1="8" y1="4" x2="56" y2="62">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="100%" stopColor="#c084fc" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="shield-glow"></div>
                    </div>
                </div>

                <div className={`splash-content ${phase === 'text' ? 'visible' : ''}`}>
                    <h1 className="splash-title">KAVALAN</h1>
                    <p className="splash-tagline">Your Personal Safety Guardian</p>
                    <div className="splash-loader">
                        <div className="loader-bar"></div>
                    </div>
                    <p className="splash-footer">🛡️ Protecting Every Step</p>
                </div>
            </div>
        </div>
    );
}

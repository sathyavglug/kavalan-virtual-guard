import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('kavalan_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadProfile();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadProfile = async () => {
        try {
            const response = await authAPI.getProfile();
            if (response.data.success) {
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        const response = await authAPI.login(credentials);
        if (response.data.success) {
            localStorage.setItem('kavalan_token', response.data.token);
            localStorage.setItem('kavalan_user', JSON.stringify(response.data.user));
            setToken(response.data.token);
            setUser(response.data.user);
        }
        return response.data;
    };

    const register = async (userData) => {
        const response = await authAPI.register(userData);
        if (response.data.success) {
            localStorage.setItem('kavalan_token', response.data.token);
            localStorage.setItem('kavalan_user', JSON.stringify(response.data.user));
            setToken(response.data.token);
            setUser(response.data.user);
        }
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('kavalan_token');
        localStorage.removeItem('kavalan_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

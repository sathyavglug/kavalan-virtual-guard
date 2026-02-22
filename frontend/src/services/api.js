import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('kavalan_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('kavalan_token');
            localStorage.removeItem('kavalan_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API calls
export const authAPI = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    getProfile: () => api.get('/auth/profile'),
};

// Emergency Contacts API
export const contactsAPI = {
    getContacts: () => api.get('/contacts'),
    addContact: (data) => api.post('/contacts', data),
    updateContact: (id, data) => api.put(`/contacts/${id}`, data),
    deleteContact: (id) => api.delete(`/contacts/${id}`),
};

// Profile API
export const profileAPI = {
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    changePassword: (data) => api.put('/profile/password', data),
    updateHomeLocation: (data) => api.put('/profile/home-location', data),
};

// SOS API
export const sosAPI = {
    triggerSOS: (data) => api.post('/sos/trigger', data),
    resolveSOS: (id) => api.put(`/sos/resolve/${id}`),
    cancelSOS: (id) => api.put(`/sos/cancel/${id}`),
    getHistory: () => api.get('/sos/history'),
    getActiveSOS: () => api.get('/sos/active'),
};

// KAVALAN AI Chat API
export const chatAPI = {
    sendMessage: (message) => api.post('/chat/message', { message }),
    getChatInfo: () => api.get('/chat/history'),
};

// Settings API
export const settingsAPI = {
    getSettings: () => api.get('/settings'),
    updateSettings: (data) => api.put('/settings', data),
    resetSettings: () => api.post('/settings/reset'),
};

export default api;


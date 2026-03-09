import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const register = (data) => API.post('/auth/register', data);
export const verifyOtp = (data) => API.post('/auth/verify-otp', data);
export const login = (data) => API.post('/auth/login', data);
export const resendOtp = (data) => API.post('/auth/resend-otp', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

// Documents
export const uploadDocument = (data) => API.post('/documents/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getMyDocuments = (params) => API.get('/documents', { params });
export const getDocument = (id) => API.get(`/documents/${id}`);
export const updateDocument = (id, data) => API.put(`/documents/${id}`, data);
export const deleteDocument = (id) => API.delete(`/documents/${id}`);
export const getDashboardStats = () => API.get('/documents/stats');

// Shares
export const shareDocument = (data) => API.post('/shares', data);
export const getSharedWithMe = () => API.get('/shares/received');
export const getSharedByMe = () => API.get('/shares/sent');
export const revokeShare = (id) => API.delete(`/shares/${id}`);

// Users
export const updateProfile = (data) => API.put('/users/profile', data);
export const getFamilyMembers = () => API.get('/users/family');
export const addFamilyMember = (data) => API.post('/users/family', data);
export const removeFamilyMember = (id) => API.delete(`/users/family/${id}`);

// Activity
export const getActivityLogs = (params) => API.get('/activity', { params });

export default API;

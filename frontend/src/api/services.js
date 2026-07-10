/**
 * Centralized API service layer.
 * All API calls go through these service functions — 
 * keeps component code clean and business logic centralized.
 */
import api from './axios';

// ─── Auth Services ─────────────────────────────────────────
export const authService = {
    /**
     * Login with email + password → returns access_token
     * Uses form-encoded body as required by OAuth2PasswordRequestForm
     */
    login: (email, password) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        return api.post('/login/access-token', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
    },

    /** Get current logged-in user profile */
    getMe: () => api.get('/users/me'),

    /** Register a new user */
    register: (email, password, fullName) =>
        api.post('/users/', { email, password, full_name: fullName }),

    /** Request a password reset link */
    forgotPassword: (email) =>
        api.post('/forgot-password', { email }),

    /** Reset password using the token from the email */
    resetPassword: (token, newPassword) =>
        api.post('/reset-password', { token, new_password: newPassword }),
};

// ─── Image Services ────────────────────────────────────────
export const videoService = {
    /** List all uploaded images for current user */
    list: () => api.get('/video/list'),

    /** Get a single image by ID */
    getById: (id) => api.get(`/video/${id}`),

    /**
     * Upload an image file for detection processing.
     * @param {File} file - image file to upload
     * @param {Function} onProgress - optional progress callback (0-100)
     */
    upload: (file, onProgress) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/video/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(pct);
                }
            },
        });
    },

    /** Delete a video by ID */
    delete: (id) => api.delete(`/video/${id}`),

    /** Clear all previous detections for user */
    clearAll: () => api.delete('/video/clear'),
};

// ─── Detection Services ───────────────────────────────────
export const detectionService = {
    /** Get all system detections */
    list: () => api.get('/detections/'),
};

// ─── Alert Services ────────────────────────────────────────
export const alertService = {
    /** List all alerts */
    list: () => api.get('/alerts/'),

    /** Get specific alert */
    getById: (alertId) => api.get(`/alerts/${alertId}`),

    /** Resolve an alert */
    resolve: (alertId) => api.put(`/alerts/${alertId}/resolve`),
};

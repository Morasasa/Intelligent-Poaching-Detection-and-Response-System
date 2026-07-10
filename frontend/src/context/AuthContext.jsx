import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';
import { authService } from '../api/services';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Initialize auth state from stored token ───────────
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await authService.getMe();
                    setUser(response.data);
                } catch {
                    // Token invalid or expired — clear storage
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // ─── Login ─────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        const response = await authService.login(email, password);
        localStorage.setItem('token', response.data.access_token);
        const userResponse = await authService.getMe();
        setUser(userResponse.data);
        return userResponse.data;
    }, []);

    // ─── Register + Auto-login ─────────────────────────────
    const register = useCallback(async (email, password, fullName) => {
        await authService.register(email, password, fullName);

        try {
            // Auto-login after successful registration
            return await login(email, password);
        } catch (error) {
            error.registrationSucceeded = true;
            throw error;
        }
    }, [login]);

    // ─── Logout ────────────────────────────────────────────
    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

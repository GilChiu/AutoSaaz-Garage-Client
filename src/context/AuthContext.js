import React, { createContext, useContext, useState, useEffect } from 'react';
import DEV_CONFIG from '../config/dev';
import { loginUser, getCurrentUser } from '../services/api';
import cache from '../utils/cache';

const AuthContext = createContext();

export { AuthContext };

// All HTTP calls for auth now routed via services/api (Supabase Functions)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // If auth is disabled in dev config, use mock user
                if (!DEV_CONFIG.ENABLE_AUTH) {
                    setUser(DEV_CONFIG.MOCK_USER);
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
                
                if (token) {
                    const response = await getCurrentUser();
                    if (response.success && response.data?.user) {
                        setUser(response.data.user);
                    } else {
                        throw new Error('Invalid user data');
                    }
                } else {
                }
            } catch (error) {
                // Clear all auth data on token validation failure
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                // No global axios instance here; token headers handled per-request in services/api
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = async (credentials) => {
        // If auth is disabled, return mock success
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(DEV_CONFIG.MOCK_USER);
            return { success: true, user: DEV_CONFIG.MOCK_USER };
        }

        try {
            const response = await loginUser(credentials);
            if (response.success) {
                const { accessToken, refreshToken, user, profile } = response.data;
                // Store tokens
                if (accessToken) {
                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('accessToken', accessToken);
                }
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }
                // Store user and profile data
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                if (profile) {
                    localStorage.setItem('profile', JSON.stringify(profile));
                }
                setUser(user);
                return { success: true, data: response.data, message: response.message };
            }
            return { success: false, message: response.message || 'Login failed' };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        // Clear all cache on logout (security best practice)
        cache.clear();
        
        // If auth is disabled, just clear user
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(null);
            return;
        }

        // Clear all possible auth tokens and data
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('profile');
        
        // Clear session storage as well
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('profile');
        
        // Clear user state
        setUser(null);
    };

    const register = async (userData) => {
        // If auth is disabled, return mock success
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(DEV_CONFIG.MOCK_USER);
            return { success: true, user: DEV_CONFIG.MOCK_USER };
        }

        // Registration is handled via the multi-step flow using Supabase Functions.
        // This method remains for backward compatibility but defers to the dedicated flow.
        return { success: false, message: 'Please use the multi-step registration flow.' };
    };

    const loginWithToken = (accessToken, userData) => {
        // If auth is disabled, use mock user
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(DEV_CONFIG.MOCK_USER);
            return;
        }

        try {
            // Store token for legacy checks
            localStorage.setItem('token', accessToken);
            setUser(userData);
        } catch (error) {
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            register,
            loginWithToken,
            authEnabled: DEV_CONFIG.ENABLE_AUTH 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
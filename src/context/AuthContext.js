import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import DEV_CONFIG from '../config/dev';

const AuthContext = createContext();

export { AuthContext };

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

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

                const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
                console.log('Checking for existing token:', token ? 'Found' : 'Not found');
                
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    console.log('Validating token with backend...');
                    
                    const response = await api.get('/auth/me');
                    if (response.data.success && response.data.data) {
                        console.log('Token valid, user authenticated:', response.data.data);
                        setUser(response.data.data);
                    } else {
                        console.log('Invalid token response, clearing auth');
                        throw new Error('Invalid user data');
                    }
                } else {
                    console.log('No token found, user not authenticated');
                }
            } catch (error) {
                console.error('Failed to validate token:', error.response?.status, error.response?.data?.message || error.message);
                
                // Clear all auth data on token validation failure
                setUser(null);
                localStorage.removeItem('token');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                delete api.defaults.headers.common['Authorization'];
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
            const response = await api.post('/auth/login', credentials);
            
            if (response.data.success) {
                const { accessToken, user } = response.data.data;
                
                // Store token
                localStorage.setItem('token', accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Set user in context
                setUser(user);
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Login failed'
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = () => {
        console.log('Logout called');
        
        // If auth is disabled, just clear user
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(null);
            return;
        }

        // Clear all possible auth tokens
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Clear session storage as well
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        
        // Clear axios auth header
        delete api.defaults.headers.common['Authorization'];
        
        // Clear user state
        setUser(null);
        
        console.log('Logout completed - all tokens cleared');
    };

    const register = async (userData) => {
        // If auth is disabled, return mock success
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(DEV_CONFIG.MOCK_USER);
            return { success: true, user: DEV_CONFIG.MOCK_USER };
        }

        try {
            // Use simple registration endpoint
            const response = await api.post('/auth/register', {
                fullName: userData.fullName,
                email: userData.email,
                phoneNumber: userData.phoneNumber
            });

            if (response.data.success) {
                const { accessToken, user } = response.data.data;
                
                // Store token
                localStorage.setItem('token', accessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                
                // Set user in context
                setUser(user);
                
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.message
                };
            } else {
                return {
                    success: false,
                    message: response.data.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Registration failed'
            };
        }
    };

    const loginWithToken = (accessToken, userData) => {
        // If auth is disabled, use mock user
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(DEV_CONFIG.MOCK_USER);
            return;
        }

        try {
            // Store token
            localStorage.setItem('token', accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            
            // Set user in context
            setUser(userData);
            
            console.log('✅ Auto-login successful with token');
        } catch (error) {
            console.error('Auto-login with token failed:', error);
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
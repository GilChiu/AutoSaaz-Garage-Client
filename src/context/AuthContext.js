import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import DEV_CONFIG from '../config/dev';

const AuthContext = createContext();

export { AuthContext };

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

                const token = localStorage.getItem('token');
                if (token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/auth/me');
                    if (response.data.success && response.data.user) {
                        setUser(response.data.user);
                    } else {
                        throw new Error('Invalid user data');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
                setUser(null);
                localStorage.removeItem('token');
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

        const response = await api.post('/auth/login', credentials);
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(user);
        return response.data;
    };

    const logout = () => {
        // If auth is disabled, just clear user
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(null);
            return;
        }

        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const register = async (userData) => {
        // If auth is disabled, return mock success
        if (!DEV_CONFIG.ENABLE_AUTH) {
            setUser(DEV_CONFIG.MOCK_USER);
            return { success: true, user: DEV_CONFIG.MOCK_USER };
        }

        const response = await api.post('/auth/register', userData);
        const { token, user } = response.data;
        if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
        }
        return response.data;
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            register,
            authEnabled: DEV_CONFIG.ENABLE_AUTH 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
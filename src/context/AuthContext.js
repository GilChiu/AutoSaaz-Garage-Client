import React, { createContext, useContext, useState, useEffect } from 'react';
import authAPI from '../api/auth.api';
import {
  getAccessToken,
  setAccessToken,
  setRefreshToken,
  getUserData,
  setUserData,
  getUserProfile,
  setUserProfile,
  clearAuthData,
} from '../services/storage.service';

const AuthContext = createContext();

export { AuthContext };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state from storage
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = getAccessToken();
                const storedUser = getUserData();
                const storedProfile = getUserProfile();

                if (token && storedUser) {
                    setUser(storedUser);
                    setProfile(storedProfile);

                    // Optionally validate token by fetching current user
                    try {
                        const response = await authAPI.getCurrentUser();
                        if (response.success && response.data) {
                            setUser(response.data.user);
                            setProfile(response.data.profile);
                            setUserData(response.data.user);
                            setUserProfile(response.data.profile);
                        }
                    } catch (err) {
                        // Token might be invalid, clear auth
                        console.error('Failed to validate token:', err);
                        clearAuthData();
                        setUser(null);
                        setProfile(null);
                    }
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
                clearAuthData();
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    /**
     * Login user
     * @param {Object} credentials - {email, password}
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    const login = async (credentials) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.login(credentials);

            if (response.success && response.data) {
                const { user, profile, accessToken, refreshToken } = response.data;

                // Store tokens and user data
                setAccessToken(accessToken);
                setRefreshToken(refreshToken);
                setUserData(user);
                setUserProfile(profile);

                // Update state
                setUser(user);
                setProfile(profile);

                return { success: true, data: response.data };
            }

            throw new Error('Login failed');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Logout user
     */
    const logout = async () => {
        try {
            const userId = user?.id;
            
            // Call logout API
            await authAPI.logout({ userId });

            // Clear all auth data
            clearAuthData();
            setUser(null);
            setProfile(null);
            setError(null);
        } catch (error) {
            console.error('Logout error:', error);
            // Clear local data even if API call fails
            clearAuthData();
            setUser(null);
            setProfile(null);
        }
    };

    /**
     * Register user - Step 1
     * @param {Object} userData - {fullName, email, phoneNumber, password}
     * @returns {Promise<{success: boolean, data: Object}>}
     */
    const registerStep1 = async (userData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.registerStep1(userData);

            if (response.success && response.data) {
                return { success: true, data: response.data };
            }

            throw new Error('Registration failed');
        } catch (err) {
            console.error('Registration Step 1 error:', err);
            setError(err.message || 'Registration failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Register user - Step 2
     * @param {Object} locationData - {userId, address, street, state, location, coordinates}
     * @returns {Promise<{success: boolean}>}
     */
    const registerStep2 = async (locationData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.registerStep2(locationData);

            if (response.success) {
                return { success: true };
            }

            throw new Error('Failed to save business location');
        } catch (err) {
            console.error('Registration Step 2 error:', err);
            setError(err.message || 'Failed to save business location');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Register user - Step 3
     * @param {Object} businessData - {userId, companyLegalName, emiratesIdUrl, tradeLicenseNumber, vatCertification}
     * @returns {Promise<{success: boolean}>}
     */
    const registerStep3 = async (businessData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.registerStep3(businessData);

            if (response.success) {
                return { success: true };
            }

            throw new Error('Failed to save business details');
        } catch (err) {
            console.error('Registration Step 3 error:', err);
            setError(err.message || 'Failed to save business details');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Verify registration with OTP
     * @param {Object} verificationData - {code, email?, phoneNumber?}
     * @returns {Promise<{success: boolean}>}
     */
    const verifyAccount = async (verificationData) => {
        try {
            setError(null);
            setLoading(true);

            const response = await authAPI.verifyRegistration(verificationData);

            if (response.success) {
                return { success: true };
            }

            throw new Error('Verification failed');
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.message || 'Verification failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resend verification code
     * @param {Object} data - {email?, phoneNumber?}
     * @returns {Promise<{success: boolean}>}
     */
    const resendVerification = async (data) => {
        try {
            setError(null);

            const response = await authAPI.resendVerificationCode(data);

            if (response.success) {
                return { success: true, message: response.message };
            }

            throw new Error('Failed to resend verification code');
        } catch (err) {
            console.error('Resend verification error:', err);
            setError(err.message || 'Failed to resend verification code');
            throw err;
        }
    };

    const value = {
        user,
        profile,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        logout,
        registerStep1,
        registerStep2,
        registerStep3,
        verifyAccount,
        resendVerification,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
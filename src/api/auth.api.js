/**
 * Authentication API Service
 * All authentication-related API calls
 */

import apiClient from './client';

/**
 * Register Step 1 - Personal Information
 * @param {Object} data
 * @param {string} data.fullName
 * @param {string} data.email
 * @param {string} data.phoneNumber
 * @param {string} data.password
 * @returns {Promise<{success: boolean, data: {userId: string, email: string, phoneNumber: string, requiresVerification: boolean}}>}
 */
export const registerStep1 = async (data) => {
  return apiClient.post('/auth/register/step1', data);
};

/**
 * Register Step 2 - Business Location
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} data.address
 * @param {string} data.street
 * @param {string} data.state
 * @param {string} data.location
 * @param {Object} [data.coordinates]
 * @returns {Promise<{success: boolean}>}
 */
export const registerStep2 = async (data) => {
  return apiClient.post('/auth/register/step2', data);
};

/**
 * Register Step 3 - Business Details
 * @param {Object} data
 * @param {string} data.userId
 * @param {string} data.companyLegalName
 * @param {string} data.emiratesIdUrl
 * @param {string} data.tradeLicenseNumber
 * @param {string} [data.vatCertification]
 * @returns {Promise<{success: boolean}>}
 */
export const registerStep3 = async (data) => {
  return apiClient.post('/auth/register/step3', data);
};

/**
 * Verify Registration (OTP)
 * @param {Object} data
 * @param {string} data.code - 6 digit OTP
 * @param {string} [data.email]
 * @param {string} [data.phoneNumber]
 * @returns {Promise<{success: boolean}>}
 */
export const verifyRegistration = async (data) => {
  return apiClient.post('/auth/verify', data);
};

/**
 * Resend Verification Code
 * @param {Object} data
 * @param {string} [data.email]
 * @param {string} [data.phoneNumber]
 * @returns {Promise<{success: boolean}>}
 */
export const resendVerificationCode = async (data) => {
  return apiClient.post('/auth/verify/resend', data);
};

/**
 * Login
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<{success: boolean, data: {user: Object, profile: Object, accessToken: string, refreshToken: string}}>}
 */
export const login = async (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

/**
 * Logout
 * @param {Object} [data]
 * @param {string} [data.userId]
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async (data = {}) => {
  return apiClient.post('/auth/logout', data);
};

/**
 * Get Current User Profile
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const getCurrentUser = async () => {
  return apiClient.get('/auth/me');
};

/**
 * Refresh Access Token
 * @param {string} refreshToken
 * @returns {Promise<{success: boolean, data: {accessToken: string}}>}
 */
export const refreshAccessToken = async (refreshToken) => {
  return apiClient.post('/auth/refresh', { refreshToken });
};

const authAPI = {
  registerStep1,
  registerStep2,
  registerStep3,
  verifyRegistration,
  resendVerificationCode,
  login,
  logout,
  getCurrentUser,
  refreshAccessToken,
};

export default authAPI;

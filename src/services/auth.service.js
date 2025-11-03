/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

function authHeaders(includeAppToken = false) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (includeAppToken) {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) headers['x-access-token'] = accessToken;
  }
  return headers;
}

/**
 * Makes an API request with proper error handling
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>}
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: { ...(options.headers || authHeaders()) },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Login user
 * @param {Object} credentials - User credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} Login response with user data and tokens
 */
export async function login(credentials) {
  const data = await apiRequest('/auth-login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });

  // Store tokens in localStorage
  if (data.success && data.data) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    localStorage.setItem('profile', JSON.stringify(data.data.profile));
  }

  return data;
}

/**
 * Logout user
 * @returns {Promise<void>}
 */
export async function logout() {
  try {
    // Stateless logout
  } catch (err) {
    console.warn('Logout handling error:', err?.message || err);
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  }
}

/**
 * Request password reset code
 * @param {string} email - User email
 * @returns {Promise<Object>}
 */
export async function forgotPassword(email) {
  return await apiRequest('/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Verify password reset code
 * @param {string} email - User email
 * @param {string} code - Reset code
 * @returns {Promise<Object>}
 */
export async function verifyResetCode(email, code) {
  return await apiRequest('/auth/password/verify-code', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  });
}

/**
 * Reset password with code
 * @param {Object} data - Reset data
 * @param {string} data.email - User email
 * @param {string} data.code - Reset code
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>}
 */
export async function resetPassword(data) {
  return await apiRequest('/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Change password (authenticated user)
 * @param {Object} data - Password change data
 * @param {string} data.currentPassword - Current password
 * @param {string} data.newPassword - New password
 * @returns {Promise<Object>}
 */
export async function changePassword(data) {
  return await apiRequest('/auth/password/change', {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
}

/**
 * Refresh access token
 * @returns {Promise<Object>}
 */
export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const data = await apiRequest('/auth-refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });

  // Update access token
  if (data.success && data.data.accessToken) {
    localStorage.setItem('accessToken', data.data.accessToken);
  }

  return data;
}

/**
 * Get current user data
 * @returns {Promise<Object>}
 */
export async function getCurrentUser() {
  return await apiRequest('/auth-me', {
    method: 'GET',
    headers: authHeaders(true),
  });
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

/**
 * Get stored user data
 * @returns {Object|null}
 */
export function getStoredUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get stored profile data
 * @returns {Object|null}
 */
export function getStoredProfile() {
  const profileStr = localStorage.getItem('profile');
  return profileStr ? JSON.parse(profileStr) : null;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result
 */
export function validatePassword(password) {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+=[\]{}|;:,.<>?-]/.test(password),
  };

  const isValid = Object.values(requirements).every(Boolean);

  return {
    isValid,
    requirements,
    message: isValid 
      ? 'Password meets all requirements' 
      : 'Password must meet all requirements',
  };
}

/**
 * Secure Storage Service
 * Handles secure storage of authentication tokens and user data
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'autosaaz_access_token',
  REFRESH_TOKEN: 'autosaaz_refresh_token',
  USER_DATA: 'autosaaz_user_data',
  USER_PROFILE: 'autosaaz_user_profile',
  REGISTRATION_DATA: 'autosaaz_registration_data',
};

/**
 * Store access token
 * @param {string} token
 */
export const setAccessToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } catch (error) {
    console.error('Error storing access token:', error);
  }
};

/**
 * Get access token
 * @returns {string|null}
 */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return null;
  }
};

/**
 * Store refresh token
 * @param {string} token
 */
export const setRefreshToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } catch (error) {
    console.error('Error storing refresh token:', error);
  }
};

/**
 * Get refresh token
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Store user data
 * @param {Object} userData
 */
export const setUserData = (userData) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

/**
 * Get user data
 * @returns {Object|null}
 */
export const getUserData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

/**
 * Store user profile
 * @param {Object} profile
 */
export const setUserProfile = (profile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error storing user profile:', error);
  }
};

/**
 * Get user profile
 * @returns {Object|null}
 */
export const getUserProfile = () => {
  try {
    const profile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return null;
  }
};

/**
 * Store registration data (for multi-step registration)
 * @param {Object} data
 */
export const setRegistrationData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Error storing registration data:', error);
  }
};

/**
 * Get registration data
 * @returns {Object|null}
 */
export const getRegistrationData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.REGISTRATION_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error retrieving registration data:', error);
    return null;
  }
};

/**
 * Clear registration data
 */
export const clearRegistrationData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_DATA);
  } catch (error) {
    console.error('Error clearing registration data:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_DATA);
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

const storageService = {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setUserData,
  getUserData,
  setUserProfile,
  getUserProfile,
  setRegistrationData,
  getRegistrationData,
  clearRegistrationData,
  clearAuthData,
  isAuthenticated,
};

export default storageService;

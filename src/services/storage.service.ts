/**
 * Secure storage service for managing tokens and sensitive data
 * Uses localStorage with basic encryption for web
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'autosaaz_access_token',
  REFRESH_TOKEN: 'autosaaz_refresh_token',
  USER_DATA: 'autosaaz_user_data',
  REGISTRATION_DATA: 'autosaaz_registration_data',
} as const;

// Simple encryption/decryption using base64 encoding
// For production, consider using a more robust encryption library
const encrypt = (data: string): string => {
  try {
    return btoa(data);
  } catch {
    return data;
  }
};

const decrypt = (data: string): string => {
  try {
    return atob(data);
  } catch {
    return data;
  }
};

/**
 * Store access token securely
 */
export const setAccessToken = (token: string): void => {
  try {
    const encrypted = encrypt(token);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, encrypted);
  } catch (error) {
    console.error('Failed to store access token:', error);
  }
};

/**
 * Retrieve access token
 */
export const getAccessToken = (): string | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!encrypted) return null;
    return decrypt(encrypted);
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return null;
  }
};

/**
 * Store refresh token securely
 */
export const setRefreshToken = (token: string): void => {
  try {
    const encrypted = encrypt(token);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, encrypted);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
};

/**
 * Retrieve refresh token
 */
export const getRefreshToken = (): string | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!encrypted) return null;
    return decrypt(encrypted);
  } catch (error) {
    console.error('Failed to retrieve refresh token:', error);
    return null;
  }
};

/**
 * Store user data
 */
export const setUserData = (user: any): void => {
  try {
    const data = JSON.stringify(user);
    const encrypted = encrypt(data);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, encrypted);
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

/**
 * Retrieve user data
 */
export const getUserData = (): any | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!encrypted) return null;
    const data = decrypt(encrypted);
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

/**
 * Store registration progress data (userId, step, etc.)
 */
export const setRegistrationData = (data: any): void => {
  try {
    const jsonData = JSON.stringify(data);
    const encrypted = encrypt(jsonData);
    localStorage.setItem(STORAGE_KEYS.REGISTRATION_DATA, encrypted);
  } catch (error) {
    console.error('Failed to store registration data:', error);
  }
};

/**
 * Retrieve registration progress data
 */
export const getRegistrationData = (): any | null => {
  try {
    const encrypted = localStorage.getItem(STORAGE_KEYS.REGISTRATION_DATA);
    if (!encrypted) return null;
    const data = decrypt(encrypted);
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to retrieve registration data:', error);
    return null;
  }
};

/**
 * Clear registration data
 */
export const clearRegistrationData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.REGISTRATION_DATA);
  } catch (error) {
    console.error('Failed to clear registration data:', error);
  }
};

/**
 * Clear all tokens (on logout)
 */
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  } catch (error) {
    console.error('Failed to clear tokens:', error);
  }
};

/**
 * Clear all stored data
 */
export const clearAll = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear all storage:', error);
  }
};

/**
 * Check if user is authenticated (has valid token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

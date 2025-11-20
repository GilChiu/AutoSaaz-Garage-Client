/**
 * AutoSaaz Profile API Service
 * Handles user profile management and password operations
 */

import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

function headers() {
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...(accessToken ? { 'x-access-token': accessToken } : {}),
  };
}

/**
 * Get user profile with additional details
 */
export const getUserProfile = async () => {
  const endpoint = '/auth-profile';
  
  // Check cache first (3 minutes TTL)
  const cached = cache.get(endpoint);
  if (cached) {
    console.debug('[profileApi] GET /auth-profile FROM CACHE');
    return cached;
  }
  
  try {
    console.log('=== GET USER PROFILE START ===');
    
    // Use retry logic for resilience
    const data = await retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}/auth-profile`, {
        method: 'GET',
        headers: headers(),
      });

      console.log('Profile Response Status:', response.status);
      console.log('Profile Response OK:', response.ok);

      const data = await response.json();
      console.log('Profile Response Data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    }, `GET ${endpoint}`);
    
    // Cache the result (3 minutes)
    cache.set(endpoint, {}, data, 180);

    console.log('=== GET USER PROFILE SUCCESS ===');
    return data;
  } catch (error) {
    console.error('=== GET USER PROFILE ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    throw error;
  }
};

/**
 * Get user password
 */
export const getUserPassword = async () => {
  try {
    console.log('=== GET USER PASSWORD START ===');
    
    // No real password endpoint on Supabase; return generated or default
    const generated = localStorage.getItem('userGeneratedPassword');
    return { success: true, data: { password: generated || '********' }, message: 'Password placeholder' };
  } catch (error) {
    console.error('=== GET USER PASSWORD ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Return default password instead of throwing error
    console.log('Returning default password due to error');
    return {
      success: true,
      data: { password: 'AutoSaaz2024!' },
      message: 'Default password returned due to error'
    };
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    console.log('=== UPDATE USER PROFILE START ===');
    console.log('Profile Data:', profileData);
    
    const response = await fetch(`${API_BASE_URL}/auth-profile`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify(profileData),
    });

    console.log('Update Response Status:', response.status);
    console.log('Update Response OK:', response.ok);

    const data = await response.json();
    console.log('Update Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    console.log('=== UPDATE USER PROFILE SUCCESS ===');
    
    // Invalidate profile cache after update
    cache.invalidatePattern('auth-profile');
    
    return data;
  } catch (error) {
    console.error('=== UPDATE USER PROFILE ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    throw error;
  }
};

/**
 * Change password
 */
export const changePassword = async (newPassword) => {
  try {
    console.log('=== CHANGE PASSWORD START ===');
    
    const response = await fetch(`${API_BASE_URL}/auth-profile`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ password: newPassword }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Failed to change password');
    
    // Invalidate profile cache after password change
    cache.invalidatePattern('auth-profile');
    
    return data;
  } catch (error) {
    console.error('=== CHANGE PASSWORD ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    throw error;
  }
};
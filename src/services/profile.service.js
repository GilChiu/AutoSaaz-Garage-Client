import { FUNCTIONS_URL, SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

/**
 * Get Supabase client for storage operations
 * Uses anon key only - no session required
 * @returns {Object} Supabase client instance
 */
const getSupabaseClient = () => {
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
};

/**
 * Get garage profile settings
 * @returns {Promise<Object>} Profile data
 */
export const getGarageProfile = async () => {
  const endpoint = '/auth-profile';
  
  // Check cache first (3 minutes TTL)
  const cached = cache.get(endpoint);
  if (cached) {

    return cached;
  }
  
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Use retry logic for resilience
    const data = await retryApiCall(async () => {
      const response = await fetch(`${FUNCTIONS_URL}/auth-profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'x-access-token': token,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }

      return data;
    }, `GET ${endpoint}`);
    
    // Cache the result (3 minutes)
    cache.set(endpoint, {}, data, 180);

    return data;
  } catch (error) {

    throw error;
  }
};

/**
 * Update garage profile settings
 * @param {Object} profileData - Profile data to update
 * @param {string} profileData.garageName - Garage business name
 * @param {string} profileData.description - Garage description
 * @param {string} profileData.location - Business address
 * @param {string} profileData.workingHours - Working hours
 * @param {string} profileData.offDays - Off days/holidays
 * @param {string} profileData.logoUrl - Logo URL (optional)
 * @returns {Promise<Object>} Updated profile data
 */
export const updateGarageProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${FUNCTIONS_URL}/auth-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'x-access-token': token,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    // Invalidate profile cache after update
    cache.invalidatePattern('auth-profile');

    return data;
  } catch (error) {

    throw error;
  }
};

/**
 * Upload profile logo to Supabase Storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Public URL of uploaded logo
 */
export const uploadProfileLogo = async (file) => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    const supabase = getSupabaseClient();
    
    // Get user profile to use user_id in file path
    const profile = JSON.parse(localStorage.getItem('profile') || '{}');
    const userId = profile.user_id || profile.userId;
    
    if (!userId) {
      throw new Error('User ID not found. Please log in again.');
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `logo_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload to garage-logos bucket
    const { error: uploadError } = await supabase.storage
      .from('garage-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {

      throw new Error(uploadError.message || 'Failed to upload logo');
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('garage-logos')
      .getPublicUrl(filePath);

    // Invalidate profile cache after logo upload (profile data may include logoUrl)
    cache.invalidatePattern('auth-profile');

    return publicUrl;
  } catch (error) {

    throw error;
  }
};

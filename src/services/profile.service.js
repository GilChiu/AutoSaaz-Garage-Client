import { BACKEND_URL } from '../config/dev';

/**
 * Get garage profile settings
 * @returns {Promise<Object>} Profile data
 */
export const getGarageProfile = async () => {
  try {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${BACKEND_URL}/auth-profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

    return data;
  } catch (error) {
    console.error('Error fetching garage profile:', error);
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

    console.log('Updating garage profile:', profileData);

    const response = await fetch(`${BACKEND_URL}/auth-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    console.log('Profile updated successfully:', data);

    return data;
  } catch (error) {
    console.error('Error updating garage profile:', error);
    throw error;
  }
};

/**
 * Upload profile logo to storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} URL of uploaded logo
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');

    console.log('Uploading logo file:', file.name, file.type, file.size);

    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: 'POST',
      headers: {
        'x-access-token': token,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload logo');
    }

    console.log('Logo uploaded successfully:', data.data.url);

    return data.data.url;
  } catch (error) {
    console.error('Error uploading profile logo:', error);
    throw error;
  }
};

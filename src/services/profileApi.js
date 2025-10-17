/**
 * AutoSaaz Profile API Service
 * Handles user profile management and password operations
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://auto-saaz-server.onrender.com/api';

/**
 * Get user profile with additional details
 */
export const getUserProfile = async () => {
  try {
    console.log('=== GET USER PROFILE START ===');
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Profile Response Status:', response.status);
    console.log('Profile Response OK:', response.ok);

    const data = await response.json();
    console.log('Profile Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch profile');
    }

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
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/password`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Password Response Status:', response.status);
    console.log('Password Response OK:', response.ok);

    const data = await response.json();
    console.log('Password Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch password');
    }

    console.log('=== GET USER PASSWORD SUCCESS ===');
    return data;
  } catch (error) {
    console.error('=== GET USER PASSWORD ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    console.log('=== UPDATE USER PROFILE START ===');
    console.log('Profile Data:', profileData);
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
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
    
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ password: newPassword }),
    });

    console.log('Password Change Response Status:', response.status);
    console.log('Password Change Response OK:', response.ok);

    const data = await response.json();
    console.log('Password Change Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    console.log('=== CHANGE PASSWORD SUCCESS ===');
    return data;
  } catch (error) {
    console.error('=== CHANGE PASSWORD ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    throw error;
  }
};
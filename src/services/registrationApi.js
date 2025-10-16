/**
 * AutoSaaz Registration API Service
 * Handles the 4-step registration flow with session management
 */

const API_BASE_URL = 'https://autosaaz-server.onrender.com/api';

/**
 * Step 1: Personal Information (NO password)
 * Returns sessionId for subsequent steps
 */
export const registerStep1 = async (fullName, email, phoneNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register/step1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName,
        email,
        phoneNumber,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Save sessionId to localStorage
    if (data.success && data.data?.sessionId) {
      localStorage.setItem('registrationSessionId', data.data.sessionId);
      localStorage.setItem('sessionExpiresAt', data.data.expiresAt);
    }

    return data;
  } catch (error) {
    console.error('Step 1 Registration Error:', error);
    throw error;
  }
};

/**
 * Step 2: Business Location
 * Requires sessionId from Step 1
 */
export const registerStep2 = async (address, street, state, location, coordinates = null) => {
  try {
    const sessionId = localStorage.getItem('registrationSessionId');
    
    if (!sessionId) {
      throw new Error('Session expired. Please start registration again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/register/step2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        address,
        street,
        state,
        location,
        ...(coordinates && { coordinates }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle session expiry
      if (response.status === 404 || response.status === 400) {
        localStorage.removeItem('registrationSessionId');
        localStorage.removeItem('sessionExpiresAt');
      }
      throw new Error(data.message || 'Failed to save business location');
    }

    return data;
  } catch (error) {
    console.error('Step 2 Registration Error:', error);
    throw error;
  }
};

/**
 * Step 3: Business Details
 * Requires sessionId from Step 1
 * Sends OTP after successful submission
 */
export const registerStep3 = async (companyLegalName, emiratesIdUrl, tradeLicenseNumber, vatCertification = '') => {
  try {
    const sessionId = localStorage.getItem('registrationSessionId');
    
    if (!sessionId) {
      throw new Error('Session expired. Please start registration again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/register/step3`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        companyLegalName,
        emiratesIdUrl,
        tradeLicenseNumber,
        ...(vatCertification && { vatCertification }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle session expiry
      if (response.status === 404 || response.status === 400) {
        localStorage.removeItem('registrationSessionId');
        localStorage.removeItem('sessionExpiresAt');
      }
      throw new Error(data.message || 'Failed to save business details');
    }

    return data;
  } catch (error) {
    console.error('Step 3 Registration Error:', error);
    throw error;
  }
};

/**
 * Step 4: Verification with OTP and Password
 * Creates user account and returns auth tokens
 */
export const verifyRegistration = async (code, password) => {
  try {
    const sessionId = localStorage.getItem('registrationSessionId');
    
    if (!sessionId) {
      throw new Error('Session expired. Please start registration again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        code,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    // Clear session data
    localStorage.removeItem('registrationSessionId');
    localStorage.removeItem('sessionExpiresAt');

    // Save auth tokens
    if (data.success && data.data) {
      if (data.data.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken);
      }
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
      }
      if (data.data.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }
    }

    return data;
  } catch (error) {
    console.error('Verification Error:', error);
    throw error;
  }
};

/**
 * Resend OTP
 * Requires sessionId from previous steps
 */
export const resendOTP = async () => {
  try {
    const sessionId = localStorage.getItem('registrationSessionId');
    
    if (!sessionId) {
      throw new Error('Session expired. Please start registration again.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/verify/resend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to resend verification code');
    }

    return data;
  } catch (error) {
    console.error('Resend OTP Error:', error);
    throw error;
  }
};

/**
 * Check if registration session is valid
 */
export const isSessionValid = () => {
  const sessionId = localStorage.getItem('registrationSessionId');
  const expiresAt = localStorage.getItem('sessionExpiresAt');
  
  if (!sessionId || !expiresAt) {
    return false;
  }
  
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();
  
  return currentTime < expiryTime;
};

/**
 * Clear registration session
 */
export const clearRegistrationSession = () => {
  localStorage.removeItem('registrationSessionId');
  localStorage.removeItem('sessionExpiresAt');
};

/**
 * Get session expiry time remaining (in seconds)
 */
export const getSessionTimeRemaining = () => {
  const expiresAt = localStorage.getItem('sessionExpiresAt');
  
  if (!expiresAt) {
    return 0;
  }
  
  const expiryTime = new Date(expiresAt).getTime();
  const currentTime = new Date().getTime();
  const remaining = Math.max(0, expiryTime - currentTime);
  
  return Math.floor(remaining / 1000); // Return in seconds
};

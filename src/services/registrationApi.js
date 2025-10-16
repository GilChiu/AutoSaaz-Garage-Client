/**
 * AutoSaaz Registration API Service
 * Handles the 4-step registration flow with session management
 */

// Use environment variable, fallback to default if not set
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://auto-saaz-server.onrender.com/api';

/**
 * Step 1: Personal Information (NO password)
 * Returns sessionId for subsequent steps
 */
export const registerStep1 = async (fullName, email, phoneNumber) => {
  try {
    console.log('=== STEP 1 REGISTRATION START ===');
    console.log('API URL:', `${API_BASE_URL}/auth/register/step1`);
    console.log('Request Data:', { fullName, email, phoneNumber });

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

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('Response Data:', data);

    if (!response.ok) {
      console.error('Registration failed with status:', response.status);
      throw new Error(data.message || 'Registration failed');
    }

    // Save sessionId to localStorage
    if (data.success && data.data?.sessionId) {
      console.log('Saving sessionId to localStorage:', data.data.sessionId);
      localStorage.setItem('registrationSessionId', data.data.sessionId);
      localStorage.setItem('sessionExpiresAt', data.data.expiresAt);
    }

    console.log('=== STEP 1 REGISTRATION SUCCESS ===');
    return data;
  } catch (error) {
    console.error('=== STEP 1 REGISTRATION ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    // Check if it's a network/CORS error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('🚨 CORS ERROR DETECTED 🚨');
      console.error('This is a backend CORS configuration issue.');
      console.error('The backend needs to allow requests from:', window.location.origin);
      throw new Error('Unable to connect to server. Please check your internet connection or contact support.');
    }
    
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
 * Step 4: Verification with OTP (NO PASSWORD)
 * Verifies OTP and returns auth tokens
 */
export const verifyRegistration = async (code) => {
  try {
    console.log('=== STEP 4 VERIFICATION START ===');
    const sessionId = localStorage.getItem('registrationSessionId');
    console.log('SessionId:', sessionId);
    console.log('OTP Code:', code);
    
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
      }),
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    const data = await response.json();
    console.log('Response Data:', data);

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
        console.log('✅ Access token saved');
      }
      if (data.data.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken);
        console.log('✅ Refresh token saved');
      }
      if (data.data.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('✅ User data saved');
      }
    }

    console.log('=== STEP 4 VERIFICATION SUCCESS ===');
    return data;
  } catch (error) {
    console.error('=== STEP 4 VERIFICATION ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
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

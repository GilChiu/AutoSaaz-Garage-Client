import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

// Use Supabase Edge Functions base URL
const API_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Always include the Supabase anon key for Functions gateway
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;

  // Include application access token for protected endpoints
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
  if (accessToken) {
    config.headers['x-autosaaz-token'] = accessToken;
  }
  config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
  return config;
});

// Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const isAuthLogin = url.includes('/auth-login');
    const isAuthRefresh = url.includes('/auth-refresh');

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthLogin && !isAuthRefresh) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Call Supabase refresh function
          const response = await axios.post(`${API_URL}/auth-refresh`, { refreshToken }, {
            headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
          });
          const { accessToken } = response.data.data;
          // Save new access token
          localStorage.setItem('accessToken', accessToken);
          // Retry original request with new app token header
          originalRequest.headers['x-autosaaz-token'] = accessToken;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear storage and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // If no refresh token or other error, redirect to login
    if (error.response?.status === 401) {
      // Do NOT redirect for invalid login attempts; just surface the error to the UI
      if (isAuthLogin) {
        return Promise.reject(error);
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
// Note: Registration uses step-based endpoints in registrationApi.js
export const registerUser = async (userData) => {
  // Minimal compatibility wrapper: calls Step 1
  const response = await api.post('/auth-register-step1', userData);
  return response.data;
};


export const loginUser = async (credentials) => {
  const response = await api.post('/auth-login', credentials);
  const { data } = response.data;
  
  // Store tokens
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return response.data;
};

export const verifyUser = async (sessionId, code) => {
  const response = await api.post('/auth-verify', { sessionId, code });
  const { data } = response.data;
  
  // Store tokens if returned (registration flow)
  if (data.accessToken) {
    localStorage.setItem('accessToken', data.accessToken);
  }
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return response.data;
};

export const logoutUser = async () => {
  try {
    // Stateless JWT: nothing to call on server; clear storage below
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear all storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// Current user (session validation)
export const getCurrentUser = async () => {
  const response = await api.get('/auth-me');
  return response.data;
};

// Booking API calls
export const createBooking = async (bookingData) => {
  const response = await api.post('/bookings', bookingData);
  return response.data;
};

export const getBookings = async () => {
  const response = await api.get('/bookings');
  return response.data;
};

// Business API calls
export const createBusiness = async (businessData) => {
  const response = await api.post('/businesses', businessData);
  return response.data;
};

export const getBusinessDetails = async (businessId) => {
  const response = await api.get(`/businesses/${businessId}`);
  return response.data;
};

// User API calls
export const fetchUserData = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};
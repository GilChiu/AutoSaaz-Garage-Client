/**
 * API Client Configuration
 * Axios instance with interceptors for authentication and error handling
 */

import axios from 'axios';
import {
  getAccessToken,
  clearAuthData,
} from '../services/storage.service';

// Get API base URL from environment variable
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://auto-saaz-server.onrender.com/api';
const API_TIMEOUT = parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000;

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Adds authentication token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles responses and errors globally
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return the data object from successful responses
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your internet connection.',
        error: error.message,
      });
    }

    const { status } = error.response;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth data and redirect to login
      clearAuthData();
      
      // Redirect to login page if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }

      return Promise.reject({
        success: false,
        message: 'Session expired. Please login again.',
        status,
      });
    }

    // Handle 403 Forbidden - Email not verified or insufficient permissions
    if (status === 403) {
      const errorMessage =
        error.response.data?.message || 'Access forbidden. Please verify your account.';
      
      return Promise.reject({
        success: false,
        message: errorMessage,
        status,
        data: error.response.data,
      });
    }

    // Handle 409 Conflict - Duplicate resource (e.g., email already exists)
    if (status === 409) {
      return Promise.reject({
        success: false,
        message: error.response.data?.message || 'This resource already exists.',
        status,
        errors: error.response.data?.errors,
      });
    }

    // Handle 423 Locked - Account locked
    if (status === 423) {
      return Promise.reject({
        success: false,
        message:
          error.response.data?.message ||
          'Your account is temporarily locked. Please try again later.',
        status,
      });
    }

    // Handle 400 Bad Request - Validation errors
    if (status === 400) {
      return Promise.reject({
        success: false,
        message: error.response.data?.message || 'Invalid request data.',
        errors: error.response.data?.errors || [],
        status,
      });
    }

    // Handle 500 Internal Server Error
    if (status === 500) {
      return Promise.reject({
        success: false,
        message: 'Server error. Please try again later.',
        status,
      });
    }

    // Handle other errors
    return Promise.reject({
      success: false,
      message: error.response.data?.message || 'An error occurred. Please try again.',
      status,
      data: error.response.data,
    });
  }
);

/**
 * Helper function to make API requests with error handling
 * @param {Function} requestFn - Axios request function
 * @returns {Promise}
 */
export const makeRequest = async (requestFn) => {
  try {
    const response = await requestFn();
    return response;
  } catch (error) {
    // Error is already formatted by the interceptor
    throw error;
  }
};

export default apiClient;

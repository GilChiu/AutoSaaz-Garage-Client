export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    BOOKING_SUMMARY: '/dashboard/booking-summary',
};

export const AUTH_CONSTANTS = {
    TOKEN_KEY: 'auth_token',
    USER_KEY: 'user_data',
};

export const ERROR_MESSAGES = {
    REQUIRED: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
};
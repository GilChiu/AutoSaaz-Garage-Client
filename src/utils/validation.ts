/**
 * Form validation utilities matching backend validation rules
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

/**
 * Validate UAE phone number format (+971XXXXXXXXX)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }

  const phoneRegex = /^\+971[0-9]{9}$/;
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Phone number must be in UAE format (+971XXXXXXXXX)' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validate full name (3-100 chars, letters and spaces only)
 */
export const validateFullName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Full name is required' };
  }

  const trimmed = name.trim();
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Full name must be at least 3 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Full name must not exceed 100 characters' };
  }

  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'Full name can only contain letters and spaces' };
  }

  return { isValid: true };
};

/**
 * Validate address field (5-255 chars)
 */
export const validateAddress = (address: string): ValidationResult => {
  if (!address) {
    return { isValid: false, error: 'Address is required' };
  }

  const trimmed = address.trim();
  
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Address must be at least 5 characters' };
  }

  if (trimmed.length > 255) {
    return { isValid: false, error: 'Address must not exceed 255 characters' };
  }

  return { isValid: true };
};

/**
 * Validate street field (3-100 chars)
 */
export const validateStreet = (street: string): ValidationResult => {
  if (!street) {
    return { isValid: false, error: 'Street is required' };
  }

  const trimmed = street.trim();
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Street must be at least 3 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Street must not exceed 100 characters' };
  }

  return { isValid: true };
};

/**
 * Validate state field (2-50 chars)
 */
export const validateState = (state: string): ValidationResult => {
  if (!state) {
    return { isValid: false, error: 'State is required' };
  }

  const trimmed = state.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'State must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'State must not exceed 50 characters' };
  }

  return { isValid: true };
};

/**
 * Validate location field (2-100 chars)
 */
export const validateLocation = (location: string): ValidationResult => {
  if (!location) {
    return { isValid: false, error: 'Location is required' };
  }

  const trimmed = location.trim();
  
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Location must be at least 2 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Location must not exceed 100 characters' };
  }

  return { isValid: true };
};

/**
 * Validate company legal name (3-255 chars)
 */
export const validateCompanyName = (name: string): ValidationResult => {
  if (!name) {
    return { isValid: false, error: 'Company legal name is required' };
  }

  const trimmed = name.trim();
  
  if (trimmed.length < 3) {
    return { isValid: false, error: 'Company name must be at least 3 characters' };
  }

  if (trimmed.length > 255) {
    return { isValid: false, error: 'Company name must not exceed 255 characters' };
  }

  return { isValid: true };
};

/**
 * Validate trade license number (5-50 chars, uppercase)
 */
export const validateTradeLicense = (license: string): ValidationResult => {
  if (!license) {
    return { isValid: false, error: 'Trade license number is required' };
  }

  const trimmed = license.trim().toUpperCase();
  
  if (trimmed.length < 5) {
    return { isValid: false, error: 'Trade license must be at least 5 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Trade license must not exceed 50 characters' };
  }

  return { isValid: true };
};

/**
 * Validate VAT certification (optional, max 50 chars, uppercase)
 */
export const validateVatCertification = (vat: string): ValidationResult => {
  if (!vat || vat.trim() === '') {
    return { isValid: true }; // Optional field
  }

  const trimmed = vat.trim().toUpperCase();
  
  if (trimmed.length > 50) {
    return { isValid: false, error: 'VAT certification must not exceed 50 characters' };
  }

  return { isValid: true };
};

/**
 * Validate OTP code (6 digits)
 */
export const validateOTP = (code: string): ValidationResult => {
  if (!code) {
    return { isValid: false, error: 'Verification code is required' };
  }

  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'Verification code must be 6 digits' };
  }

  return { isValid: true };
};

/**
 * Format phone number to UAE format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If starts with 971, add +
  if (digits.startsWith('971')) {
    return `+${digits}`;
  }
  
  // If starts with 0, replace with +971
  if (digits.startsWith('0')) {
    return `+971${digits.substring(1)}`;
  }
  
  // If 9 digits, assume local number
  if (digits.length === 9) {
    return `+971${digits}`;
  }
  
  return phone;
};

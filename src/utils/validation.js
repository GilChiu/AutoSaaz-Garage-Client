/**
 * Validation Utilities
 * Client-side validation matching backend rules
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {{isValid: boolean, error: string}}
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate UAE phone number format
 * Expected format: +971XXXXXXXXX
 * @param {string} phoneNumber
 * @returns {{isValid: boolean, error: string}}
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber || !phoneNumber.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // UAE phone number format: +971 followed by 9 digits
  const phoneRegex = /^\+971[0-9]{9}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return {
      isValid: false,
      error: 'Please enter a valid UAE phone number (e.g., +971501234567)',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate password strength
 * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 * @param {string} password
 * @returns {{isValid: boolean, error: string}}
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return {
      isValid: false,
      error: 'Password must be at least 8 characters long',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one uppercase letter',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one lowercase letter',
    };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      error: 'Password must contain at least one special character',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate full name
 * 3-100 chars, letters and spaces only
 * @param {string} fullName
 * @returns {{isValid: boolean, error: string}}
 */
export const validateFullName = (fullName) => {
  if (!fullName || !fullName.trim()) {
    return { isValid: false, error: 'Full name is required' };
  }

  const trimmedName = fullName.trim();

  if (trimmedName.length < 3) {
    return {
      isValid: false,
      error: 'Full name must be at least 3 characters long',
    };
  }

  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: 'Full name must not exceed 100 characters',
    };
  }

  // Only letters and spaces allowed
  if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
    return {
      isValid: false,
      error: 'Full name can only contain letters and spaces',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate address
 * 5-255 chars
 * @param {string} address
 * @returns {{isValid: boolean, error: string}}
 */
export const validateAddress = (address) => {
  if (!address || !address.trim()) {
    return { isValid: false, error: 'Address is required' };
  }

  const trimmedAddress = address.trim();

  if (trimmedAddress.length < 5) {
    return {
      isValid: false,
      error: 'Address must be at least 5 characters long',
    };
  }

  if (trimmedAddress.length > 255) {
    return {
      isValid: false,
      error: 'Address must not exceed 255 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate street
 * 3-100 chars
 * @param {string} street
 * @returns {{isValid: boolean, error: string}}
 */
export const validateStreet = (street) => {
  if (!street || !street.trim()) {
    return { isValid: false, error: 'Street is required' };
  }

  const trimmedStreet = street.trim();

  if (trimmedStreet.length < 3) {
    return {
      isValid: false,
      error: 'Street must be at least 3 characters long',
    };
  }

  if (trimmedStreet.length > 100) {
    return {
      isValid: false,
      error: 'Street must not exceed 100 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate state
 * 2-50 chars
 * @param {string} state
 * @returns {{isValid: boolean, error: string}}
 */
export const validateState = (state) => {
  if (!state || !state.trim()) {
    return { isValid: false, error: 'State/Emirate is required' };
  }

  const trimmedState = state.trim();

  if (trimmedState.length < 2) {
    return {
      isValid: false,
      error: 'State/Emirate must be at least 2 characters long',
    };
  }

  if (trimmedState.length > 50) {
    return {
      isValid: false,
      error: 'State/Emirate must not exceed 50 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate location
 * 2-100 chars
 * @param {string} location
 * @returns {{isValid: boolean, error: string}}
 */
export const validateLocation = (location) => {
  if (!location || !location.trim()) {
    return { isValid: false, error: 'Location is required' };
  }

  const trimmedLocation = location.trim();

  if (trimmedLocation.length < 2) {
    return {
      isValid: false,
      error: 'Location must be at least 2 characters long',
    };
  }

  if (trimmedLocation.length > 100) {
    return {
      isValid: false,
      error: 'Location must not exceed 100 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate company legal name
 * 3-255 chars
 * @param {string} companyName
 * @returns {{isValid: boolean, error: string}}
 */
export const validateCompanyName = (companyName) => {
  if (!companyName || !companyName.trim()) {
    return { isValid: false, error: 'Company legal name is required' };
  }

  const trimmedName = companyName.trim();

  if (trimmedName.length < 3) {
    return {
      isValid: false,
      error: 'Company name must be at least 3 characters long',
    };
  }

  if (trimmedName.length > 255) {
    return {
      isValid: false,
      error: 'Company name must not exceed 255 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate trade license number
 * 5-50 chars, uppercase
 * @param {string} tradeLicense
 * @returns {{isValid: boolean, error: string}}
 */
export const validateTradeLicense = (tradeLicense) => {
  if (!tradeLicense || !tradeLicense.trim()) {
    return { isValid: false, error: 'Trade license number is required' };
  }

  const trimmedLicense = tradeLicense.trim();

  if (trimmedLicense.length < 5) {
    return {
      isValid: false,
      error: 'Trade license must be at least 5 characters long',
    };
  }

  if (trimmedLicense.length > 50) {
    return {
      isValid: false,
      error: 'Trade license must not exceed 50 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate VAT certification (optional)
 * Max 50 chars, uppercase
 * @param {string} vatCert
 * @returns {{isValid: boolean, error: string}}
 */
export const validateVatCertification = (vatCert) => {
  if (!vatCert || !vatCert.trim()) {
    return { isValid: true, error: '' }; // Optional field
  }

  const trimmedVat = vatCert.trim();

  if (trimmedVat.length > 50) {
    return {
      isValid: false,
      error: 'VAT certification must not exceed 50 characters',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Validate OTP code
 * 6 digits
 * @param {string} code
 * @returns {{isValid: boolean, error: string}}
 */
export const validateOtpCode = (code) => {
  if (!code || !code.trim()) {
    return { isValid: false, error: 'Verification code is required' };
  }

  if (!/^\d{6}$/.test(code)) {
    return {
      isValid: false,
      error: 'Verification code must be 6 digits',
    };
  }

  return { isValid: true, error: '' };
};

/**
 * Format phone number to UAE format
 * Converts various inputs to +971XXXXXXXXX format
 * @param {string} phoneNumber
 * @returns {string}
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  let digits = phoneNumber.replace(/\D/g, '');

  // If starts with 971, add +
  if (digits.startsWith('971')) {
    return '+' + digits;
  }

  // If starts with 0, replace with +971
  if (digits.startsWith('0')) {
    return '+971' + digits.substring(1);
  }

  // If 9 digits, assume local UAE number
  if (digits.length === 9) {
    return '+971' + digits;
  }

  return phoneNumber;
};

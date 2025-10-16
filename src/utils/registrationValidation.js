/**
 * Form validation utilities for AutoSaaz registration
 */

/**
 * Validate full name
 * Must be 3-100 characters, letters and spaces only
 */
export const validateFullName = (fullName) => {
  if (!fullName || fullName.trim().length < 3) {
    return 'Full name must be at least 3 characters';
  }
  
  if (fullName.length > 100) {
    return 'Full name must be less than 100 characters';
  }
  
  if (!/^[a-zA-Z\s]+$/.test(fullName)) {
    return 'Full name can only contain letters and spaces';
  }
  
  return null;
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validate UAE phone number
 * Accepts: +971XXXXXXXXX, 971XXXXXXXXX, 05XXXXXXXX
 */
export const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) {
    return 'Phone number is required';
  }
  
  // Remove all spaces and dashes
  const cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Check various UAE formats
  const uaePatterns = [
    /^\+971[1-9][0-9]{8}$/,  // +971XXXXXXXXX
    /^971[1-9][0-9]{8}$/,     // 971XXXXXXXXX
    /^0[1-9][0-9]{8}$/,       // 05XXXXXXXX
  ];
  
  const isValid = uaePatterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) {
    return 'Please enter a valid UAE phone number (e.g., +971501234567)';
  }
  
  return null;
};

/**
 * Format phone number to UAE international format
 * Converts any UAE format to +971XXXXXXXXX
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all spaces and dashes
  let cleaned = phoneNumber.replace(/[\s-]/g, '');
  
  // Convert to +971 format
  if (cleaned.startsWith('+971')) {
    return cleaned;
  } else if (cleaned.startsWith('971')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+971${cleaned.slice(1)}`;
  }
  
  return phoneNumber; // Return as-is if format is unknown
};

/**
 * Validate password (for Step 4 - Verification screen)
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character (@$!%*?&)
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return 'Password must contain at least one special character (@$!%*?&)';
  }
  
  return null;
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

/**
 * Validate OTP code
 * Must be exactly 6 digits
 */
export const validateOTP = (code) => {
  if (!code) {
    return 'Verification code is required';
  }
  
  if (!/^\d{6}$/.test(code)) {
    return 'Verification code must be exactly 6 digits';
  }
  
  return null;
};

/**
 * Validate address (for Step 2)
 */
export const validateAddress = (address) => {
  if (!address || address.trim().length < 5) {
    return 'Address must be at least 5 characters';
  }
  
  if (address.length > 500) {
    return 'Address must be less than 500 characters';
  }
  
  return null;
};

/**
 * Validate street
 */
export const validateStreet = (street) => {
  if (!street || street.trim().length < 2) {
    return 'Street is required';
  }
  
  if (street.length > 255) {
    return 'Street must be less than 255 characters';
  }
  
  return null;
};

/**
 * Validate state/emirate
 */
export const validateState = (state) => {
  if (!state || state.trim().length < 2) {
    return 'State/Emirate is required';
  }
  
  const validEmirates = [
    'Abu Dhabi',
    'Dubai',
    'Sharjah',
    'Ajman',
    'Umm Al Quwain',
    'Ras Al Khaimah',
    'Fujairah'
  ];
  
  // Optional: Check if it's a valid UAE emirate (case-insensitive)
  // You can remove this check if users can enter any state
  const isValidEmirate = validEmirates.some(
    emirate => emirate.toLowerCase() === state.toLowerCase()
  );
  
  if (!isValidEmirate) {
    return `Please enter a valid UAE emirate (${validEmirates.join(', ')})`;
  }
  
  return null;
};

/**
 * Validate location
 */
export const validateLocation = (location) => {
  if (!location || location.trim().length < 2) {
    return 'Location is required';
  }
  
  if (location.length > 255) {
    return 'Location must be less than 255 characters';
  }
  
  return null;
};

/**
 * Validate company legal name (for Step 3)
 */
export const validateCompanyName = (companyName) => {
  if (!companyName || companyName.trim().length < 3) {
    return 'Company name must be at least 3 characters';
  }
  
  if (companyName.length > 255) {
    return 'Company name must be less than 255 characters';
  }
  
  return null;
};

/**
 * Validate trade license number
 */
export const validateTradeLicense = (tradeLicense) => {
  if (!tradeLicense || tradeLicense.trim().length < 5) {
    return 'Trade license number is required';
  }
  
  if (tradeLicense.length > 100) {
    return 'Trade license number must be less than 100 characters';
  }
  
  return null;
};

/**
 * Validate VAT certification (optional field)
 */
export const validateVATCertification = (vatCert) => {
  // VAT is optional, so empty is valid
  if (!vatCert) {
    return null;
  }
  
  if (vatCert.length > 100) {
    return 'VAT certification must be less than 100 characters';
  }
  
  return null;
};

/**
 * Validate Emirates ID file
 */
export const validateEmiratesIdFile = (file) => {
  if (!file) {
    return 'Emirates ID is required';
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (!validTypes.includes(file.type)) {
    return 'Emirates ID must be an image (JPG, PNG) or PDF file';
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'File size must be less than 5MB';
  }
  
  return null;
};

/**
 * Get password strength
 * Returns: weak, medium, strong
 */
export const getPasswordStrength = (password) => {
  if (!password) return 'weak';
  
  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[@$!%*?&]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
};

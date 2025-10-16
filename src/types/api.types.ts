// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
  meta: {
    timestamp: string;
  };
}

// ============================================
// Registration Types
// ============================================

export interface RegisterStep1Request {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface RegisterStep1Response {
  userId: string;
  email: string;
  phoneNumber: string;
  requiresVerification: boolean;
}

export interface RegisterStep2Request {
  userId: string;
  address: string;
  street: string;
  state: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RegisterStep3Request {
  userId: string;
  companyLegalName: string;
  emiratesIdUrl: string;
  tradeLicenseNumber: string;
  vatCertification?: string;
}

// ============================================
// Verification Types
// ============================================

export interface VerifyRequest {
  code: string;
  email?: string;
  phoneNumber?: string;
}

export interface ResendVerificationRequest {
  email?: string;
  phoneNumber?: string;
}

// ============================================
// Login Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  role: 'garage_owner' | 'admin' | 'customer';
  status: 'active' | 'inactive' | 'suspended' | 'locked';
  createdAt: string;
  updatedAt?: string;
}

export interface GarageProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  companyLegalName?: string;
  tradeLicenseNumber?: string;
  vatCertification?: string;
  address?: string;
  street?: string;
  state?: string;
  location?: string;
  status: 'pending' | 'active' | 'suspended';
}

export interface LoginResponse {
  user: User;
  profile: GarageProfile;
  accessToken: string;
  refreshToken: string;
}

// ============================================
// Logout Types
// ============================================

export interface LogoutRequest {
  userId?: string;
}

// ============================================
// Error Types
// ============================================

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{
    field?: string;
    message: string;
    code?: string;
  }>;
  meta: {
    timestamp: string;
  };
}

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR'
}

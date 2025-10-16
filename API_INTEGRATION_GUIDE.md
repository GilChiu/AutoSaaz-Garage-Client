# AutoSaaz API Integration Guide

## Overview
This document provides a comprehensive guide to the AutoSaaz API integration in the Garage Client application. The backend is hosted on Render at `https://auto-saaz-server.onrender.com`.

## Configuration

### Environment Variables
Create or update `.env` file in the root directory:

```env
REACT_APP_API_BASE_URL=https://auto-saaz-server.onrender.com/api
REACT_APP_API_TIMEOUT=30000
REACT_APP_ENV=production
REACT_APP_USE_MOCKS=false
```

## Architecture

### Directory Structure
```
src/
├── api/
│   ├── client.js              # Axios client with interceptors
│   └── auth.api.js            # Authentication API endpoints
├── services/
│   └── storage.service.js     # Secure local storage management
├── context/
│   ├── AuthContext.js         # Authentication state management
│   └── RegistrationContext.js # Multi-step registration state
├── types/
│   └── api.types.js           # API type definitions (JSDoc)
├── utils/
│   └── validation.js          # Form validation utilities
└── pages/
    ├── LoginPage.jsx          # Login screen
    ├── RegisterPage.jsx       # Registration Step 1 (Personal Info)
    ├── RegisterPage2.jsx      # Registration Step 2 (Business Location)
    ├── RegisterPage3.jsx      # Registration Step 3 (Business Details)
    └── VerificationPage.jsx   # OTP Verification screen
```

## Authentication Flow

### 1. Registration Flow (4 Steps)

#### Step 1: Personal Information (`RegisterPage.jsx`)
- **Endpoint**: `POST /api/auth/register/step1`
- **Fields**:
  - Full Name (3-100 chars, letters and spaces only)
  - Email (valid email format)
  - Phone Number (UAE format: +971XXXXXXXXX)
  - Password (min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char)
- **Response**: Returns `userId`, `email`, `phoneNumber`, `requiresVerification`
- **Navigation**: 
  - If `requiresVerification` is true → `/verify-account`
  - Otherwise → `/register-step-2`

#### Step 1.5: Email/Phone Verification (`VerificationPage.jsx`)
- **Endpoint**: `POST /api/auth/verify`
- **Fields**:
  - 6-digit OTP code
  - Email or Phone Number
- **Resend Code**: `POST /api/auth/verify/resend`
- **Navigation**: On success → `/register-step-2`

#### Step 2: Business Location (`RegisterPage2.jsx`)
- **Endpoint**: `POST /api/auth/register/step2`
- **Fields**:
  - userId (from Step 1)
  - Address (5-255 chars)
  - Street (3-100 chars)
  - State/Emirate (2-50 chars)
  - Location/Area (2-100 chars)
- **Navigation**: On success → `/register-step-3`

#### Step 3: Business Details (`RegisterPage3.jsx`)
- **Endpoint**: `POST /api/auth/register/step3`
- **Fields**:
  - userId (from Step 1)
  - Company Legal Name (3-255 chars)
  - Emirates ID File Upload (image/pdf)
  - Trade License Number (5-50 chars, uppercase)
  - VAT Certification (optional, max 50 chars, uppercase)
- **Navigation**: On success → `/login`

### 2. Login Flow

#### Login (`LoginPage.jsx`)
- **Endpoint**: `POST /api/auth/login`
- **Fields**:
  - Email
  - Password
- **Response**: Returns `user`, `profile`, `accessToken`, `refreshToken`
- **Storage**: Tokens and user data stored securely in localStorage
- **Navigation**: On success → `/dashboard`

#### Error Handling
- **401 Unauthorized**: Invalid credentials
- **403 Forbidden**: Email not verified
- **423 Locked**: Account locked due to too many failed attempts

### 3. Logout Flow

#### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Action**: Clears all tokens and user data from storage
- **Navigation**: Redirects to `/login`

## API Client (`src/api/client.js`)

### Features
- **Base URL**: Configured via environment variables
- **Timeout**: 30 seconds (configurable)
- **Request Interceptor**: Automatically adds Bearer token to all requests
- **Response Interceptor**: 
  - Handles errors globally
  - Formats error messages
  - Auto-redirects on 401 (unauthorized)
  - Clears auth data on session expiry

### Error Handling
```javascript
{
  success: false,
  message: "Error description",
  status: 401,
  errors: [...] // validation errors if applicable
}
```

## Storage Service (`src/services/storage.service.js`)

### Methods
- `setAccessToken(token)` - Store access token
- `getAccessToken()` - Retrieve access token
- `setRefreshToken(token)` - Store refresh token
- `getRefreshToken()` - Retrieve refresh token
- `setUserData(userData)` - Store user data
- `getUserData()` - Retrieve user data
- `setUserProfile(profile)` - Store user profile
- `getUserProfile()` - Retrieve user profile
- `setRegistrationData(data)` - Store registration progress
- `getRegistrationData()` - Retrieve registration progress
- `clearRegistrationData()` - Clear registration data
- `clearAuthData()` - Clear all authentication data
- `isAuthenticated()` - Check if user is authenticated

## Form Validation (`src/utils/validation.js`)

### Validation Functions
- `validateEmail(email)` - Email format validation
- `validatePhoneNumber(phoneNumber)` - UAE phone format (+971XXXXXXXXX)
- `validatePassword(password)` - Strong password rules
- `validateFullName(fullName)` - 3-100 chars, letters and spaces
- `validateAddress(address)` - 5-255 chars
- `validateStreet(street)` - 3-100 chars
- `validateState(state)` - 2-50 chars
- `validateLocation(location)` - 2-100 chars
- `validateCompanyName(companyName)` - 3-255 chars
- `validateTradeLicense(tradeLicense)` - 5-50 chars
- `validateVatCertification(vatCert)` - Optional, max 50 chars
- `validateOtpCode(code)` - 6 digits
- `formatPhoneNumber(phoneNumber)` - Convert to +971XXXXXXXXX format

### Return Format
```javascript
{
  isValid: boolean,
  error: string // empty if valid
}
```

## AuthContext (`src/context/AuthContext.js`)

### State
- `user` - Current user object
- `profile` - User's garage profile
- `loading` - Loading state
- `error` - Error message
- `isAuthenticated` - Boolean authentication status

### Methods
- `login(credentials)` - Login user
- `logout()` - Logout user
- `registerStep1(userData)` - Register step 1
- `registerStep2(locationData)` - Register step 2
- `registerStep3(businessData)` - Register step 3
- `verifyAccount(verificationData)` - Verify OTP code
- `resendVerification(data)` - Resend verification code

## RegistrationContext (`src/context/RegistrationContext.js`)

### State
- `registrationData` - All registration form data
- `currentStep` - Current step in registration flow

### Methods
- `updateRegistrationData(data)` - Update registration data
- `goToNextStep()` - Move to next step
- `goToPreviousStep()` - Move to previous step
- `resetRegistration()` - Clear all registration data

## Testing

### Testing Registration Flow

1. **Test Step 1** - Personal Info
```javascript
// Navigate to /register
// Fill in:
fullName: "John Smith"
email: "john.smith@example.com"
phoneNumber: "+971501234567"
password: "Test@123456"
// Click "Next"
// Should redirect to /verify-account
```

2. **Test Verification**
```javascript
// Check server console for OTP code
// Enter 6-digit code
// Click "Verify Code"
// Should redirect to /register-step-2
```

3. **Test Step 2** - Business Location
```javascript
// Fill in:
address: "Building 123, Al Barsha"
street: "Sheikh Zayed Road"
state: "Dubai"
location: "Al Barsha 1"
// Click "Next"
// Should redirect to /register-step-3
```

4. **Test Step 3** - Business Details
```javascript
// Fill in:
companyLegalName: "Smith Auto Garage LLC"
emiratesId: Upload file
tradeLicenseNumber: "CN-1234567"
vatCertification: "TRN-123456" (optional)
// Click "Complete Registration"
// Should redirect to /login
```

5. **Test Login**
```javascript
// Navigate to /login
// Fill in:
email: "john.smith@example.com"
password: "Test@123456"
// Click "Sign In"
// Should redirect to /dashboard
```

### Common Error Scenarios

#### 1. Email Already Exists (409 Conflict)
```
Error: "This email is already registered. Please login instead."
```

#### 2. Invalid Phone Format
```
Error: "Please enter a valid UAE phone number (e.g., +971501234567)"
```

#### 3. Weak Password
```
Error: "Password must contain at least one uppercase letter"
```

#### 4. Email Not Verified (403 Forbidden)
```
Error: "Please verify your email before logging in"
```

#### 5. Account Locked (423 Locked)
```
Error: "Your account is temporarily locked. Please try again later."
```

#### 6. Invalid OTP Code
```
Error: "Verification code is invalid or expired"
```

## Security Best Practices

### Implemented Security Features
1. ✅ Tokens stored in localStorage (can be upgraded to sessionStorage or secure cookies)
2. ✅ Bearer token automatically attached to all authenticated requests
3. ✅ Auto-logout on token expiry or 401 errors
4. ✅ Client-side validation matching backend rules
5. ✅ Password strength validation
6. ✅ Phone number format validation (UAE format)
7. ✅ Email format validation
8. ✅ HTTPS connection to backend (Render)

### Recommended Enhancements
1. 🔄 Implement refresh token rotation
2. 🔄 Add CSRF protection
3. 🔄 Implement rate limiting feedback
4. 🔄 Add biometric authentication (future)
5. 🔄 Implement secure file upload for Emirates ID

## API Response Formats

### Success Response
```javascript
{
  success: true,
  message: "Operation successful",
  data: { ... },
  meta: {
    timestamp: "2025-10-16T..."
  }
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  errors: [
    {
      field: "email",
      message: "Invalid email format"
    }
  ],
  meta: {
    timestamp: "2025-10-16T..."
  }
}
```

## Troubleshooting

### Issue: API calls failing
**Solution**: 
1. Check `.env` file has correct API_BASE_URL
2. Verify backend server is running
3. Check browser console for CORS errors
4. Verify internet connection

### Issue: "Session expired" on every request
**Solution**:
1. Clear localStorage
2. Re-login
3. Check if token is being stored correctly
4. Verify token format in localStorage

### Issue: OTP code not working
**Solution**:
1. Check server console logs for generated OTP
2. Ensure you're using the most recent code
3. Verify email/phone matches registration data
4. Try resend code feature

### Issue: Registration data lost between steps
**Solution**:
1. Check localStorage for registration data
2. Verify RegistrationContext is properly wrapped around app
3. Check browser console for errors
4. Ensure page refreshes don't clear context

## Development Notes

- **OTP Codes**: In development, check server console for OTP codes
- **Rate Limiting**: 5 login attempts per 15 minutes
- **Token Expiry**: Access token valid for 7 days, refresh token for 30 days
- **Account Lockout**: 5 failed login attempts locks account for 30 minutes
- **File Upload**: Emirates ID upload is placeholder - needs backend file upload API

## Next Steps

### Immediate
1. ✅ Test all registration steps end-to-end
2. ✅ Test login/logout flow
3. ✅ Test OTP verification and resend
4. ✅ Handle all error scenarios

### Future Enhancements
1. 🔄 Implement file upload for Emirates ID
2. 🔄 Add "Remember Me" functionality
3. 🔄 Implement password reset flow
4. 🔄 Add social login (Google, Apple)
5. 🔄 Implement refresh token rotation
6. 🔄 Add biometric authentication
7. 🔄 Implement session timeout warning
8. 🔄 Add loading skeletons for better UX

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs for backend errors
3. Review this documentation
4. Contact backend team for API issues

## Version History

### v1.0.0 (Current)
- ✅ Complete authentication API integration
- ✅ Multi-step registration flow
- ✅ OTP verification
- ✅ Login/Logout functionality
- ✅ Form validation
- ✅ Error handling
- ✅ Responsive UI
- ✅ Secure token storage

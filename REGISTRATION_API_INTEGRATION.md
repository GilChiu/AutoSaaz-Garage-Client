# AutoSaaz Backend Registration API Integration

## ✅ Implementation Complete

This document provides a comprehensive overview of the 4-step registration flow integration with the AutoSaaz backend API.

---

## 📋 Overview

The registration process has been updated to integrate with the AutoSaaz backend API hosted at `https://autosaaz-server.onrender.com/api`. The flow uses **session-based management** instead of user-based management, with the user account created only after successful OTP verification in Step 4.

### Key Changes
- **Password moved from Step 1 to Step 4** (verification screen)
- **Session-based flow**: `sessionId` replaces `userId` until final verification
- **Auto-login**: JWT tokens provided after Step 4, user logged in automatically
- **UAE-specific validation**: Phone format (+971XXXXXXXXX), Emirates, trade license
- **File upload placeholder**: Emirates ID upload needs backend endpoint

---

## 🔄 4-Step Registration Flow

### Step 1: Personal Information (`RegisterPage.jsx`)
**Endpoint**: `POST /api/garage/register/step-1`

**Fields Collected**:
- Full Name
- Email Address
- Phone Number (UAE format: +971XXXXXXXXX)

**Backend Response**:
```json
{
  "success": true,
  "message": "Step 1 completed successfully",
  "data": {
    "sessionId": "uuid-v4-session-id",
    "expiresAt": "2024-01-15T12:00:00Z"
  }
}
```

**What Happens**:
1. User enters personal information (NO password)
2. Frontend validates full name, email, phone number
3. Phone number formatted to UAE international format (+971XXXXXXXXX)
4. API call to `registerStep1(fullName, email, phoneNumber)`
5. Backend creates registration session (24-hour expiry)
6. `sessionId` saved to localStorage and RegistrationContext
7. Navigate to Step 2

**Error Handling**:
- Email already registered → Show error message
- Session expired → Show error and redirect to Step 1
- Validation errors → Display specific field errors

---

### Step 2: Business Location (`RegisterPage2.jsx`)
**Endpoint**: `POST /api/garage/register/step-2`

**Fields Collected**:
- Address
- Street
- State/Emirate
- Location (city/area)

**Backend Request**:
```json
{
  "sessionId": "uuid-from-step-1",
  "address": "123 Main Street",
  "street": "Al Wasl Road",
  "state": "Dubai",
  "location": "Jumeirah"
}
```

**Backend Response**:
```json
{
  "success": true,
  "message": "Step 2 completed successfully"
}
```

**What Happens**:
1. User enters business location details
2. Frontend validates address, street, state, location
3. Reads `sessionId` from localStorage (set in Step 1)
4. API call to `registerStep2(address, street, state, location)`
5. Backend validates session and saves location data
6. Navigate to Step 3

**Error Handling**:
- Session expired → Redirect to Step 1 after 3 seconds
- Invalid state/emirate → Show validation error
- Session not found → Clear session and redirect to Step 1

---

### Step 3: Business Details (`RegisterPage3.jsx`)
**Endpoint**: `POST /api/garage/register/step-3`

**Fields Collected**:
- Company Legal Name
- Emirates ID (file upload)
- Trade License Number
- VAT Certification (optional)

**Backend Request**:
```json
{
  "sessionId": "uuid-from-step-1",
  "companyLegalName": "AutoFix Garage LLC",
  "emiratesIdUrl": "https://storage.url/emirates-id.pdf",
  "tradeLicenseNumber": "TL-12345678",
  "vatCertification": "VAT-987654" // optional
}
```

**Backend Response**:
```json
{
  "success": true,
  "message": "Step 3 completed successfully. OTP sent to email and phone."
}
```

**What Happens**:
1. User enters business details and uploads Emirates ID
2. Frontend validates company name, trade license, VAT (if provided)
3. **File upload is currently a placeholder** - needs implementation:
   - Upload Emirates ID file to storage service (AWS S3, Cloudinary, etc.)
   - Get back the URL of the uploaded file
   - Pass URL to `registerStep3`
4. API call to `registerStep3(companyName, emiratesIdUrl, tradeLicense, vatCert)`
5. Backend validates session, saves business data, and **sends OTP** via email/SMS
6. Navigate to Step 4 (verification)

**Error Handling**:
- Session expired → Redirect to Step 1 after 3 seconds
- Invalid trade license format → Show validation error
- File validation → Check file type (PDF, image), max size (5MB)

**TODO**: Implement Emirates ID file upload
```javascript
// Example implementation needed:
const uploadEmiratesId = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axios.post('/api/upload/emirates-id', formData);
  return response.data.url; // Return uploaded file URL
};
```

---

### Step 4: OTP Verification + Password (`VerificationPage.jsx`)
**Endpoint**: `POST /api/garage/register/verify`

**Fields Collected**:
- 6-digit OTP code
- Password (NEW - moved from Step 1)
- Confirm Password (NEW)

**Backend Request**:
```json
{
  "sessionId": "uuid-from-step-1",
  "code": "123456",
  "password": "SecurePass123!"
}
```

**Backend Response**:
```json
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+971501234567",
      "role": "garage_owner"
    },
    "accessToken": "jwt-access-token",
    "refreshToken": "jwt-refresh-token"
  }
}
```

**What Happens**:
1. User enters 6-digit OTP code received via email/SMS
2. User creates password (8+ characters, uppercase, lowercase, number, special char)
3. User confirms password
4. Frontend validates OTP format (6 digits)
5. Frontend validates password strength
6. Frontend validates passwords match
7. API call to `verifyRegistration(code, password)`
8. Backend verifies OTP code against session
9. Backend creates user account with hashed password
10. Backend returns JWT tokens (accessToken + refreshToken)
11. Frontend saves tokens to localStorage
12. Frontend calls `login(user, accessToken)` to update AuthContext
13. Frontend clears registration session from localStorage
14. Frontend resets RegistrationContext
15. Navigate to `/dashboard` (auto-logged in)

**Error Handling**:
- Invalid OTP code → Show error message
- OTP expired → Show error, suggest resend
- Session expired → Redirect to Step 1 after 3 seconds
- Weak password → Show validation error
- Passwords don't match → Show validation error

**OTP Resend**:
- Endpoint: `POST /api/garage/register/resend-otp`
- Reads `sessionId` from localStorage
- Sends new OTP code via email/SMS
- Shows success message for 5 seconds

---

## 📁 Files Created/Modified

### New Files

#### `src/services/registrationApi.js` (NEW)
API service layer for registration endpoints.

**Functions**:
- `registerStep1(fullName, email, phoneNumber)` - Step 1 API call
- `registerStep2(address, street, state, location)` - Step 2 API call
- `registerStep3(companyLegalName, emiratesIdUrl, tradeLicenseNumber, vatCertification)` - Step 3 API call
- `verifyRegistration(code, password)` - Step 4 API call
- `resendOTP()` - Resend OTP code

**Session Helpers**:
- `isSessionValid()` - Check if registration session is valid
- `clearRegistrationSession()` - Clear session from localStorage
- `getSessionTimeRemaining()` - Get minutes remaining before session expires

**Features**:
- Reads `sessionId` and `expiresAt` from localStorage
- Automatic session validation before API calls
- Error handling with descriptive messages
- Token storage after successful verification

---

#### `src/utils/registrationValidation.js` (NEW)
Form validation utilities matching backend requirements.

**Validators**:
- `validateFullName(fullName)` - 2+ characters, letters/spaces only
- `validateEmail(email)` - Valid email format
- `validatePhoneNumber(phoneNumber)` - UAE format validation
- `formatPhoneNumber(phoneNumber)` - Converts to +971XXXXXXXXX
- `validatePassword(password)` - 8+ chars, uppercase, lowercase, number, special char
- `validatePasswordConfirmation(password, confirmPassword)` - Passwords match
- `validateOTP(code)` - 6 digits exactly
- `validateAddress(address)` - 5+ characters
- `validateStreet(street)` - 3+ characters
- `validateState(state)` - Valid UAE Emirate
- `validateLocation(location)` - 2+ characters
- `validateCompanyName(companyName)` - 2+ characters
- `validateTradeLicense(tradeLicense)` - Non-empty
- `validateVATCertification(vatCert)` - Non-empty
- `validateEmiratesIdFile(file)` - File type (PDF/image), max size 5MB

**Utilities**:
- `getPasswordStrength(password)` - Returns 'weak', 'medium', or 'strong'
- UAE Emirates list: Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain

---

### Modified Files

#### `src/context/RegistrationContext.js` (UPDATED)
Added new fields to support 4-step flow:
- `sessionId` - Registration session ID from backend
- `fullName` - User's full name (instead of just name)
- `companyName` - Company legal name (instead of garageName)
- `tradeLicense` - Trade license number
- `vatCert` - VAT certification (optional)
- `emiratesIdUrl` - URL of uploaded Emirates ID file
- `password` - User password (moved to Step 4)
- `confirmPassword` - Password confirmation

Updated `resetRegistration` to:
- Clear all new fields
- Remove `registrationSessionId` and `sessionExpiresAt` from localStorage

---

#### `src/pages/RegisterPage.jsx` (Step 1 - UPDATED)
**Changes**:
- Added imports: `registerStep1`, validation functions
- Updated `handleSubmit`:
  - Validates `fullName`, `email`, `phoneNumber`
  - Formats phone to UAE format using `formatPhoneNumber`
  - Calls `registerStep1(fullName, email, formattedPhone)`
  - Saves `sessionId` to RegistrationContext
  - Handles "email already registered" error
  - Handles session expiry
  - Navigates to `/register-step-2` on success

**UI**: UNCHANGED (still has fullName, email, phoneNumber fields only)

---

#### `src/pages/RegisterPage2.jsx` (Step 2 - UPDATED)
**Changes**:
- Added imports: `registerStep2`, validation functions
- Updated `handleSubmit`:
  - Validates `address`, `street`, `state`, `location`
  - Reads `sessionId` from localStorage (set by Step 1)
  - Calls `registerStep2(address, street, state, location)`
  - Handles session expiry with redirect to Step 1
  - Navigates to `/register-step-3` on success

**UI**: UNCHANGED (still has address, street, state, location fields)

---

#### `src/pages/RegisterPage3.jsx` (Step 3 - UPDATED)
**Changes**:
- Added imports: `registerStep3`, validation functions
- Updated `handleSubmit`:
  - Validates `companyName`, `tradeLicense`, `emiratesId` file, `vatCert` (if provided)
  - **File upload is placeholder** - uses 'placeholder-url-for-emirates-id'
  - Calls `registerStep3(companyName, emiratesIdUrl, tradeLicense, vatCert)`
  - Handles session expiry with redirect to Step 1
  - Navigates to `/verify-account` on success

**UI**: UNCHANGED (still has companyName, emiratesId upload, tradeLicense, vatCert fields)

**TODO**: Implement file upload for Emirates ID

---

#### `src/pages/VerificationPage.jsx` (Step 4 - MAJOR UPDATE)
**Changes**:
- Added imports: `verifyRegistration`, `resendOTP`, validation functions, `useAuth`
- Added state:
  - `password` - User's password
  - `confirmPassword` - Password confirmation
  - `showPassword` - Toggle password visibility
  - `showConfirmPassword` - Toggle confirm password visibility
  - `resendLoading` - Resend OTP loading state
  - `resendSuccess` - Show "Code sent!" message
- Updated `handleSubmit`:
  - Validates OTP code (6 digits)
  - Validates password (8+ chars, complexity)
  - Validates passwords match
  - Calls `verifyRegistration(code, password)`
  - Saves `accessToken` and `refreshToken` to localStorage
  - Calls `login(user, accessToken)` for auto-login
  - Clears registration session from localStorage
  - Resets RegistrationContext
  - Navigates to `/dashboard`
- Updated `handleResendCode`:
  - Calls `resendOTP()` API
  - Shows success message for 5 seconds
  - Handles session expiry

**UI Changes** (NEW):
- Added password input field with show/hide toggle
- Added confirm password input field with show/hide toggle
- Added password strength indicator (weak/medium/strong)
- Updated "Verify Code" button text to "Complete Registration"
- Updated resend button to show loading state ("Sending...")
- Added success message after resend ("✓ Code sent!")

---

#### `.env` (UPDATED)
**Changes**:
- Updated `REACT_APP_API_URL` from `https://api.autosaaz.com/api` to `https://autosaaz-server.onrender.com/api`
- Updated `REACT_APP_USE_MOCKS` from `true` to `false` to enable real API calls

---

## 🔒 Session Management

### Session Storage
- **Where**: `localStorage`
- **Keys**:
  - `registrationSessionId` - Session UUID from Step 1
  - `sessionExpiresAt` - ISO timestamp when session expires
- **Expiry**: 24 hours from creation
- **Cleared**: After successful Step 4 verification

### Session Validation
Before each API call (Steps 2-4), the frontend checks:
1. `sessionId` exists in localStorage
2. `expiresAt` timestamp is in the future
3. If invalid → Clear session and show error

### Session Expiry Handling
- Show error message: "Your session has expired. Redirecting to start..."
- Wait 3 seconds
- Navigate to `/register` (Step 1)
- User starts registration from beginning

---

## 🔐 Authentication Flow

### After Step 4 Verification
1. Backend creates user account
2. Backend generates JWT tokens:
   - `accessToken` - Short-lived (15 minutes typical)
   - `refreshToken` - Long-lived (7 days typical)
3. Frontend saves tokens to localStorage:
   ```javascript
   localStorage.setItem('accessToken', response.data.accessToken);
   localStorage.setItem('refreshToken', response.data.refreshToken);
   ```
4. Frontend calls `login(user, accessToken)` from AuthContext
5. User is automatically logged in
6. Navigate to `/dashboard`

### Token Storage
- **Where**: `localStorage`
- **Keys**:
  - `accessToken` - For API authentication
  - `refreshToken` - For token renewal
- **Usage**: Included in Authorization header for protected routes

---

## ✅ Validation Rules

### Personal Information (Step 1)
- **Full Name**: 2+ characters, letters and spaces only
- **Email**: Valid email format (RFC 5322)
- **Phone**: UAE format `+971XXXXXXXXX` (9 digits after +971)

### Business Location (Step 2)
- **Address**: 5+ characters
- **Street**: 3+ characters
- **State**: Must be a valid UAE Emirate (Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, Umm Al Quwain)
- **Location**: 2+ characters

### Business Details (Step 3)
- **Company Name**: 2+ characters
- **Trade License**: Non-empty
- **Emirates ID File**: PDF or image, max 5MB
- **VAT Certification**: Optional, non-empty if provided

### Verification (Step 4)
- **OTP Code**: Exactly 6 digits
- **Password**: 
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)
- **Confirm Password**: Must match password

### Password Strength Meter
- **Weak**: Basic requirements not met
- **Medium**: Meets minimum requirements (8 chars, basic complexity)
- **Strong**: 12+ characters with all complexity requirements

---

## 🚨 Error Handling

### Common Errors

#### Email Already Registered
- **Step**: 1
- **Message**: "This email is already registered. Please use a different email or login."
- **Action**: User can try different email or navigate to login

#### Session Expired
- **Steps**: 2, 3, 4
- **Message**: "Your session has expired. Redirecting to start..."
- **Action**: Wait 3 seconds, redirect to Step 1

#### Invalid OTP Code
- **Step**: 4
- **Message**: "Invalid verification code. Please check and try again."
- **Action**: User can re-enter code or request resend

#### OTP Expired
- **Step**: 4
- **Message**: "Verification code has expired. Please request a new code."
- **Action**: User clicks "Resend Code" button

#### Weak Password
- **Step**: 4
- **Message**: "Password must be at least 8 characters with uppercase, lowercase, number, and special character."
- **Action**: User improves password strength

#### Passwords Don't Match
- **Step**: 4
- **Message**: "Passwords do not match. Please check and try again."
- **Action**: User re-enters confirm password

---

## 🔄 OTP Resend

### Functionality
- **Button**: "Resend Code" (changes to "Sending..." when loading)
- **Endpoint**: `POST /api/garage/register/resend-otp`
- **Cooldown**: None (backend may enforce rate limiting)
- **Success Message**: "✓ Code sent!" (shows for 5 seconds)

### Implementation
```javascript
const handleResendCode = async () => {
  setResendLoading(true);
  try {
    await resendOTP(); // Reads sessionId from localStorage
    setResendSuccess(true);
    setTimeout(() => setResendSuccess(false), 5000);
  } catch (err) {
    setError(err.message);
  } finally {
    setResendLoading(false);
  }
};
```

---

## 📝 Testing Checklist

### Step 1 Testing
- [ ] Enter valid full name, email, phone → Should navigate to Step 2
- [ ] Enter invalid email → Should show validation error
- [ ] Enter invalid UAE phone → Should show validation error
- [ ] Enter already registered email → Should show "email already registered" error
- [ ] Check `sessionId` saved to localStorage
- [ ] Check `sessionExpiresAt` is 24 hours in future

### Step 2 Testing
- [ ] Enter valid address, street, state, location → Should navigate to Step 3
- [ ] Enter invalid state (non-UAE emirate) → Should show validation error
- [ ] Wait for session to expire → Should redirect to Step 1
- [ ] Clear `sessionId` from localStorage manually → Should show session error

### Step 3 Testing
- [ ] Enter valid company name, trade license, upload Emirates ID → Should navigate to Step 4
- [ ] Skip VAT certification (optional field) → Should still work
- [ ] Upload invalid file type (e.g., .exe) → Should show validation error
- [ ] Upload file > 5MB → Should show validation error
- [ ] Check OTP sent notification (email/SMS)

### Step 4 Testing
- [ ] Enter valid OTP + strong password → Should auto-login and navigate to dashboard
- [ ] Enter invalid OTP → Should show error
- [ ] Enter weak password → Should show validation error
- [ ] Passwords don't match → Should show validation error
- [ ] Click "Resend Code" → Should show "Code sent!" message
- [ ] Check `accessToken` and `refreshToken` saved to localStorage
- [ ] Check user logged in (AuthContext updated)
- [ ] Check registration session cleared from localStorage

### End-to-End Testing
- [ ] Complete all 4 steps successfully → Should land on dashboard as logged-in user
- [ ] Refresh page during Step 2 → Should maintain session (sessionId in localStorage)
- [ ] Close browser and reopen during Step 3 → Should maintain session
- [ ] Wait 24 hours and try Step 2 → Should show session expired error

---

## 🔧 Backend API Endpoints Reference

### Base URL
```
https://autosaaz-server.onrender.com/api
```

### Endpoints

#### 1. Register Step 1 - Personal Information
```
POST /api/garage/register/step-1
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+971501234567"
}

Response (200 OK):
{
  "success": true,
  "message": "Step 1 completed successfully",
  "data": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "expiresAt": "2024-01-15T12:00:00Z"
  }
}

Errors:
- 400: Email already registered
- 400: Invalid phone number format
```

#### 2. Register Step 2 - Business Location
```
POST /api/garage/register/step-2
Content-Type: application/json

Request Body:
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "address": "123 Main Street",
  "street": "Al Wasl Road",
  "state": "Dubai",
  "location": "Jumeirah"
}

Response (200 OK):
{
  "success": true,
  "message": "Step 2 completed successfully"
}

Errors:
- 400: Session not found or expired
- 400: Invalid state (must be UAE emirate)
```

#### 3. Register Step 3 - Business Details
```
POST /api/garage/register/step-3
Content-Type: application/json

Request Body:
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "companyLegalName": "AutoFix Garage LLC",
  "emiratesIdUrl": "https://storage.url/emirates-id.pdf",
  "tradeLicenseNumber": "TL-12345678",
  "vatCertification": "VAT-987654" // optional
}

Response (200 OK):
{
  "success": true,
  "message": "Step 3 completed successfully. OTP sent to email and phone."
}

Errors:
- 400: Session not found or expired
- 400: Invalid trade license format
```

#### 4. Verify Registration - Complete Registration
```
POST /api/garage/register/verify
Content-Type: application/json

Request Body:
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "code": "123456",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "success": true,
  "message": "Registration completed successfully",
  "data": {
    "user": {
      "id": "user-uuid",
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+971501234567",
      "role": "garage_owner"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}

Errors:
- 400: Invalid verification code
- 400: Code has expired
- 400: Session not found or expired
- 400: Password does not meet requirements
```

#### 5. Resend OTP
```
POST /api/garage/register/resend-otp
Content-Type: application/json

Request Body:
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}

Response (200 OK):
{
  "success": true,
  "message": "Verification code sent successfully"
}

Errors:
- 400: Session not found or expired
- 429: Too many requests (rate limiting)
```

---

## 🚀 Next Steps

### Immediate Tasks
1. **Implement Emirates ID File Upload** (RegisterPage3.jsx)
   - Set up file upload service (AWS S3, Cloudinary, or backend endpoint)
   - Update `registerStep3` call to use real uploaded URL
   - Add progress indicator during upload

2. **Test Registration Flow**
   - Test all 4 steps with real backend
   - Test error scenarios (invalid OTP, session expiry)
   - Test OTP resend functionality
   - Verify auto-login after Step 4

3. **Update AuthContext** (Optional Enhancement)
   - Remove old `register` function (no longer used)
   - Add token refresh logic
   - Handle token expiry with refresh token

### Optional Enhancements
1. **Session Timer UI**
   - Show countdown timer on each step (e.g., "Session expires in 23:45")
   - Alert user when session is about to expire (5 minutes remaining)

2. **OTP Resend Cooldown**
   - Disable "Resend Code" button for 60 seconds after send
   - Show countdown: "Resend Code (45s)"

3. **Password Strength Meter**
   - Visual progress bar (red/yellow/green)
   - Real-time feedback as user types
   - Suggestions for improving password

4. **Form Persistence**
   - Save form data to localStorage on each step
   - Restore data if user refreshes page
   - Clear data after successful registration

---

## 📞 Support

For backend API issues or questions, contact the AutoSaaz backend team or refer to the API documentation.

For frontend implementation questions, see this integration guide.

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: ✅ Implementation Complete (File Upload Pending)

# Quick Start - Testing Registration Flow

## 🚀 Getting Started

### 1. Restart Development Server
The `.env` file was updated to point to the real backend API. You need to restart the dev server for changes to take effect.

```powershell
# Stop the current server (Ctrl+C in the terminal)
# Then restart:
npm start
```

### 2. Open the Application
Navigate to: `http://localhost:3000/register`

---

## 🧪 Test the 4-Step Registration

### Step 1: Personal Information
1. Enter your details:
   - **Full Name**: John Doe
   - **Email**: Use a real email (you'll receive OTP)
   - **Phone**: Use UAE format, e.g., `0501234567` (will be auto-formatted to `+971501234567`)

2. Click **Next**
3. ✅ Should navigate to Step 2
4. ✅ Check browser console: `sessionId` should be logged
5. ✅ Check localStorage: `registrationSessionId` should be set

### Step 2: Business Location
1. Enter business location:
   - **Address**: 123 Main Street, Building 5
   - **Street**: Al Wasl Road
   - **State**: Dubai (or another UAE emirate)
   - **Location**: Jumeirah

2. Click **Next**
3. ✅ Should navigate to Step 3

### Step 3: Business Details
1. Enter business information:
   - **Company Name**: AutoFix Garage LLC
   - **Emirates ID**: Upload a PDF or image (max 5MB)
   - **Trade License**: TL-12345678
   - **VAT Certification**: VAT-987654 (optional, can leave blank)

2. Click **Next**
3. ✅ Should navigate to Verification page
4. ✅ You should receive OTP via email/SMS

### Step 4: Verification + Password
1. Check your email/phone for the 6-digit OTP code
2. Enter the OTP code in the 6 input boxes
3. **Create Password**:
   - Must be 8+ characters
   - Include uppercase, lowercase, number, special character
   - Example: `SecurePass123!`
4. **Confirm Password**: Re-enter the same password
5. Click **Complete Registration**
6. ✅ Should navigate to `/dashboard`
7. ✅ You should be automatically logged in
8. ✅ Check localStorage: `accessToken` and `refreshToken` should be set
9. ✅ Check localStorage: `registrationSessionId` should be cleared

---

## 🔍 What to Check

### Browser DevTools (F12)

#### Console Tab
Look for API calls and responses:
- Step 1: `POST /api/garage/register/step-1` → sessionId
- Step 2: `POST /api/garage/register/step-2` → success
- Step 3: `POST /api/garage/register/step-3` → OTP sent
- Step 4: `POST /api/garage/register/verify` → tokens

#### Network Tab
- Filter by `Fetch/XHR`
- Watch for `200 OK` responses
- Check for any `400` or `500` errors

#### Application Tab (localStorage)
After Step 1:
```
registrationSessionId: "550e8400-e29b-41d4-a716-446655440000"
sessionExpiresAt: "2024-01-15T12:00:00Z"
```

After Step 4 (successful):
```
accessToken: "eyJhbGciOiJIUzI1NiIs..."
refreshToken: "eyJhbGciOiJIUzI1NiIs..."
```

Registration session should be cleared:
```
registrationSessionId: (removed)
sessionExpiresAt: (removed)
```

---

## 🐛 Common Issues & Solutions

### Issue: "Session expired" error on Step 2
**Cause**: `sessionId` not found in localStorage  
**Solution**: 
- Check Step 1 completed successfully
- Check browser console for errors in Step 1
- Try registering again from Step 1

### Issue: OTP not received
**Cause**: Email/phone number might be invalid  
**Solution**: 
- Check email spam folder
- Verify phone number is correct UAE format
- Check backend logs for email/SMS sending errors

### Issue: "Invalid verification code"
**Cause**: OTP code is wrong or expired  
**Solution**: 
- Double-check the code from email/SMS
- Click "Resend Code" to get a new code
- Codes typically expire after 10 minutes

### Issue: Password validation error
**Cause**: Password doesn't meet requirements  
**Solution**: 
- Use at least 8 characters
- Include: uppercase (A-Z), lowercase (a-z), number (0-9), special (!@#$%^&*)
- Example: `SecurePass123!`

### Issue: Can't upload Emirates ID
**Cause**: File upload is currently a placeholder  
**Solution**: 
- Upload any PDF or image file
- It will use a placeholder URL
- Real file upload needs backend endpoint (see TODO in REGISTRATION_API_INTEGRATION.md)

### Issue: Not redirected to dashboard after Step 4
**Cause**: AuthContext might not be set up correctly  
**Solution**: 
- Check browser console for errors
- Verify tokens are saved to localStorage
- Check AuthContext.js for `login` function

---

## 🔄 Test Error Scenarios

### Test: Email Already Registered
1. Complete registration once
2. Start new registration with same email
3. ✅ Should show error: "This email is already registered"

### Test: Session Expired
1. Start registration (Step 1)
2. Wait 24 hours (or manually delete `registrationSessionId` from localStorage)
3. Try to continue to Step 2
4. ✅ Should show error and redirect to Step 1 after 3 seconds

### Test: Invalid OTP
1. Complete Steps 1-3
2. Enter wrong OTP code (e.g., `000000`)
3. Click "Complete Registration"
4. ✅ Should show error: "Invalid verification code"

### Test: Passwords Don't Match
1. Complete Steps 1-3, enter OTP
2. Enter password: `SecurePass123!`
3. Enter confirm password: `DifferentPass456!`
4. Click "Complete Registration"
5. ✅ Should show error: "Passwords do not match"

### Test: Resend OTP
1. Complete Steps 1-3
2. On verification page, click "Resend Code"
3. ✅ Button should show "Sending..."
4. ✅ Success message should appear: "✓ Code sent!"
5. ✅ Check email/phone for new code

---

## 📊 Password Strength Meter Test

Try different passwords and check the strength indicator:

| Password | Strength | Reason |
|----------|----------|--------|
| `pass` | Weak | Too short |
| `password` | Weak | No uppercase, number, special char |
| `Password1` | Medium | Missing special character |
| `Pass1!` | Medium | Less than 8 characters |
| `Password123!` | Strong | Meets all requirements |
| `SecureP@ssw0rd` | Strong | 12+ chars, all requirements |

---

## 🎯 Success Criteria

Registration is working correctly if:
- ✅ All 4 steps complete without errors
- ✅ OTP received via email/SMS
- ✅ User automatically logged in after Step 4
- ✅ User redirected to `/dashboard`
- ✅ JWT tokens saved to localStorage
- ✅ Registration session cleared from localStorage
- ✅ User can access protected routes

---

## 📝 Next Steps After Testing

Once registration works:
1. **Implement file upload** for Emirates ID (see `RegisterPage3.jsx` TODO)
2. **Update AuthContext** to use new token-based authentication
3. **Add session timer UI** to show remaining time
4. **Add OTP resend cooldown** (60-second delay)
5. **Test on mobile devices** for responsive design

---

## 🆘 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Network tab for failed API calls
3. Verify `.env` file has correct API URL: `https://autosaaz-server.onrender.com/api`
4. Verify `REACT_APP_USE_MOCKS=false` in `.env`
5. Restart dev server after changing `.env`
6. Check `REGISTRATION_API_INTEGRATION.md` for detailed documentation

---

**Happy Testing! 🚀**

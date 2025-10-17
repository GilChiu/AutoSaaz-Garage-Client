# Backend URL Configuration Issue - FIXED ✅

## The Problem

The code was using a **hardcoded URL** instead of reading from environment variables.

### Before (Hardcoded):
```javascript
const API_BASE_URL = 'https://auto-saaz-server.onrender.com/api';
```

### After (Using Environment Variable):
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://auto-saaz-server.onrender.com/api';
```

---

## ⚠️ IMPORTANT: Verify Your Backend URL

There are **two different URLs** in your configuration:

1. **Local .env file**: `https://auto-saaz-server.onrender.com/api` (with hyphen: `auto-saaz`)
2. **Console error**: `https://auto-saaz-server.onrender.com/api` (no hyphen: `autosaaz`)

### Which One is Correct?

You need to verify which URL your backend is actually hosted at:

#### Test Option 1 (with hyphen):
```bash
curl https://auto-saaz-server.onrender.com/api/health
```

#### Test Option 2 (no hyphen):
```bash
curl https://autosaaz-server.onrender.com/api/health
```

Whichever one responds successfully is the correct URL.

---

## Update Steps

### 1. Update Local .env File

Once you know the correct URL, update your local `.env`:

```properties
# If backend is at auto-saaz-server (WITH hyphen)
REACT_APP_API_URL=https://auto-saaz-server.onrender.com/api

# OR if backend is at autosaaz-server (NO hyphen)
REACT_APP_API_URL=https://autosaaz-server.onrender.com/api
```

### 2. Update Vercel Environment Variable

Go to Vercel Dashboard:
1. Project Settings → Environment Variables
2. Edit `REACT_APP_API_URL`
3. Set to the correct backend URL
4. **Important**: Select which environments (Production, Preview, Development)
5. Click "Save"

### 3. Redeploy

After updating Vercel environment variables, you must redeploy:

#### Option A: Redeploy in Vercel Dashboard
- Go to Deployments tab
- Click "..." menu on latest deployment
- Click "Redeploy"

#### Option B: Push a new commit
```bash
git add .
git commit -m "fix: Use environment variable for API URL"
git push origin api-integration
```

---

## Verification Checklist

- [ ] Verify correct backend URL (test both with curl)
- [ ] Update local `.env` file with correct URL
- [ ] Update Vercel environment variable with correct URL
- [ ] Restart local dev server: `npm start`
- [ ] Test locally: `http://localhost:3000/register`
- [ ] Redeploy to Vercel
- [ ] Test production: `https://auto-saaz-garage-client.vercel.app/register`
- [ ] Check browser console for API URL (should match your env variable)

---

## How to Test Backend URL

### Option 1: Use Browser
Open in your browser:
- `https://auto-saaz-server.onrender.com/api` (should show API info or health check)
- `https://autosaaz-server.onrender.com/api` (should show API info or health check)

### Option 2: Use curl (PowerShell)
```powershell
# Test with hyphen
curl https://auto-saaz-server.onrender.com/api

# Test without hyphen
curl https://autosaaz-server.onrender.com/api
```

### Option 3: Use PowerShell Invoke-WebRequest
```powershell
# Test with hyphen
Invoke-WebRequest -Uri "https://auto-saaz-server.onrender.com/api" -Method GET

# Test without hyphen
Invoke-WebRequest -Uri "https://autosaaz-server.onrender.com/api" -Method GET
```

---

## Expected Result

After fixing the URL and redeploying, your console should show:

```
=== STEP 1 REGISTRATION START ===
API URL: https://[CORRECT-URL]/api/auth/register/step1
Request Data: { ... }
Response Status: 200  ← Should work if CORS is configured
Response OK: true
```

---

## Summary of Changes Made

✅ **Fixed**: `src/services/registrationApi.js` now uses `process.env.REACT_APP_API_URL`  
⚠️ **Action Required**: Verify correct backend URL and update environment variables  
⚠️ **Action Required**: Redeploy to Vercel after updating environment variable  

---

## Still Getting CORS Error?

Even with the correct URL, you'll still get CORS errors until the backend team adds CORS configuration. See `CORS_ISSUE_FIX.md` for details.

The CORS fix is separate from the URL issue and must be done by the backend team.

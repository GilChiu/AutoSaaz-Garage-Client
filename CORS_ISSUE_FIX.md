# CORS Issue Fix Guide

## 🚨 The Problem

You're getting this error:
```
Access to fetch at 'https://autosaaz-server.onrender.com/api/auth/register/step1' 
from origin 'https://auto-saaz-garage-client.vercel.app' 
has been blocked by CORS policy
```

### What This Means

**CORS (Cross-Origin Resource Sharing)** is a security feature in web browsers. Your frontend is hosted on one domain (`auto-saaz-garage-client.vercel.app`) and trying to make requests to a different domain (`autosaaz-server.onrender.com`). The backend server must explicitly allow this.

---

## ✅ Solution (Backend Configuration Required)

**This is a BACKEND issue, not a frontend issue.** The backend server needs to be updated to allow requests from your frontend domain.

### Option 1: Update Backend CORS Configuration (Recommended)

#### For Node.js/Express Server:

1. **Install CORS package** (if not already installed):
```bash
npm install cors
```

2. **Add CORS middleware** to your server (e.g., `server.js` or `app.js`):

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Add CORS configuration BEFORE routes
app.use(cors({
  origin: [
    'https://auto-saaz-garage-client.vercel.app',  // Production frontend
    'http://localhost:3000',                        // Local development
    'http://localhost:3001'                         // Alternative local port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24 hours
}));

// Your routes go here
app.use('/api/auth', authRoutes);
app.use('/api/garage', garageRoutes);
// ... other routes

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

#### For NestJS Server:

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ✅ Enable CORS
  app.enableCors({
    origin: [
      'https://auto-saaz-garage-client.vercel.app',
      'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  await app.listen(3000);
}
bootstrap();
```

---

### Option 2: Dynamic Origin (Allow All Subdomains)

If you want to allow all Vercel preview deployments:

```javascript
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      /^https:\/\/.*\.vercel\.app$/,  // All Vercel deployments
      'https://auto-saaz-garage-client.vercel.app'
    ];
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

---

### Option 3: Environment Variable Based (Most Flexible)

```javascript
// .env file
ALLOWED_ORIGINS=https://auto-saaz-garage-client.vercel.app,http://localhost:3000

// server.js
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
```

---

## 🔍 Verify CORS Configuration

### Test with curl:

```bash
curl -I -X OPTIONS \
  -H "Origin: https://auto-saaz-garage-client.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  https://autosaaz-server.onrender.com/api/auth/register/step1
```

### Expected Response Headers:

```
Access-Control-Allow-Origin: https://auto-saaz-garage-client.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

---

## 🛠️ Alternative Solutions (If You Can't Modify Backend)

### Option A: Use a Proxy (Not Recommended for Production)

If you absolutely cannot modify the backend, you can use a CORS proxy (NOT recommended for production):

```javascript
// Only use this temporarily!
const PROXY_URL = 'https://cors-anywhere.herokuapp.com/';
const API_BASE_URL = PROXY_URL + 'https://autosaaz-server.onrender.com/api';
```

⚠️ **Warning**: This is insecure and should only be used for testing.

### Option B: Backend Proxy Route

Create a proxy route in your frontend Next.js API routes or Vercel serverless functions:

```javascript
// pages/api/register-proxy.js (if using Next.js)
export default async function handler(req, res) {
  const response = await fetch('https://autosaaz-server.onrender.com/api/auth/register/step1', {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body)
  });

  const data = await response.json();
  res.status(response.status).json(data);
}
```

Then update your frontend to call `/api/register-proxy` instead of the backend directly.

---

## 🐛 Debugging CORS Issues

### 1. Check Browser Console

Open DevTools (F12) and look for:
- Network tab: Check the OPTIONS preflight request
- Console tab: Look for CORS error messages

### 2. Check Response Headers

In Network tab, click on the failed request and check:
- **Request Headers**: Should include `Origin: https://auto-saaz-garage-client.vercel.app`
- **Response Headers**: Should include `Access-Control-Allow-Origin`

### 3. Test with Postman

CORS is a **browser-only** security feature. Test the API with Postman to verify the endpoint works:

```
POST https://autosaaz-server.onrender.com/api/auth/register/step1
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+971501234567"
}
```

If it works in Postman but not in browser → CORS issue  
If it doesn't work in Postman → Backend API issue

---

## 📋 Checklist for Backend Team

Send this checklist to the backend developer:

- [ ] Install `cors` package: `npm install cors`
- [ ] Add CORS middleware BEFORE routes in server configuration
- [ ] Add frontend domain to allowed origins: `https://auto-saaz-garage-client.vercel.app`
- [ ] Add localhost for development: `http://localhost:3000`
- [ ] Allow required methods: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- [ ] Allow required headers: `Content-Type, Authorization`
- [ ] Set `credentials: true` if using cookies/auth
- [ ] Restart backend server after changes
- [ ] Test with curl or browser DevTools
- [ ] Deploy changes to production (Render)

---

## 🎯 Quick Fix for Testing

If you need to test immediately and can't wait for backend changes:

1. **Use Chrome with CORS disabled** (ONLY for testing):
```bash
# Windows
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\chromedev"

# Mac
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev" --disable-web-security
```

⚠️ **WARNING**: Never use this for production or with sensitive data!

2. **Test on localhost**:
   - Run both frontend and backend on localhost
   - CORS is less strict on localhost

---

## 📞 Contact Backend Team

**What to tell them:**

> "The frontend at `https://auto-saaz-garage-client.vercel.app` is getting CORS errors when calling the API at `https://autosaaz-server.onrender.com`. Please add CORS configuration to allow requests from our frontend domain. See the CORS_ISSUE_FIX.md file for implementation details."

**Share this file with them** for implementation instructions.

---

## ✅ After Backend Fix

Once the backend is updated:

1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5)
3. Test registration flow again
4. Check browser console for detailed logs (now enabled)

The enhanced logging in `registrationApi.js` will now show:
- ✅ Request URL and data
- ✅ Response status and headers
- ✅ Detailed error messages
- ✅ CORS error detection

---

## 📊 Expected Console Output (After Fix)

### Successful Request:
```
=== STEP 1 REGISTRATION START ===
API URL: https://autosaaz-server.onrender.com/api/auth/register/step1
Request Data: { fullName: "John Doe", email: "john@example.com", phoneNumber: "+971501234567" }
Response Status: 200
Response OK: true
Response Headers: { 
  access-control-allow-origin: "https://auto-saaz-garage-client.vercel.app",
  content-type: "application/json"
}
Response Data: { success: true, data: { sessionId: "...", expiresAt: "..." } }
Saving sessionId to localStorage: 550e8400-e29b-41d4-a716-446655440000
=== STEP 1 REGISTRATION SUCCESS ===
```

### CORS Error (Current):
```
=== STEP 1 REGISTRATION START ===
API URL: https://autosaaz-server.onrender.com/api/auth/register/step1
Request Data: { fullName: "John Doe", email: "john@example.com", phoneNumber: "+971501234567" }
=== STEP 1 REGISTRATION ERROR ===
Error Type: TypeError
Error Message: Failed to fetch
🚨 CORS ERROR DETECTED 🚨
This is a backend CORS configuration issue.
The backend needs to allow requests from: https://auto-saaz-garage-client.vercel.app
```

---

**Summary**: This is a backend configuration issue. The backend server needs to add CORS headers to allow requests from your frontend domain. Share this guide with the backend team for the fix. 🚀

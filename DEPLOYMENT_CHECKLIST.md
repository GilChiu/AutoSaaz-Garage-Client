# ✅ Backend Integration Checklist

## Pre-Deployment Setup

### 1. Environment Configuration

**Local Development** (Create `.env.local`):
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_USE_MOCKS=false
REACT_APP_APP_NAME=AutoSaaz Garage App
```

**Production** (Update `.env.production` or Vercel):
```bash
REACT_APP_API_URL=https://autosaaz-server.onrender.com/api
REACT_APP_USE_MOCKS=false
REACT_APP_APP_NAME=AutoSaaz Garage App
CI=false
GENERATE_SOURCEMAP=false
```

---

## Testing Sequence

### Phase 1: Mock Mode (Safe Testing)
- [ ] Set `REACT_APP_USE_MOCKS=true`
- [ ] Run `npm start`
- [ ] Verify dashboard loads
- [ ] Verify bookings display in table
- [ ] Click a booking → detail page loads
- [ ] Click "Update Booking" → success notification
- [ ] Click "Cancel Booking" → confirm modal → success
- [ ] All UI looks correct ✅

### Phase 2: API Mode (Local)
- [ ] Ensure backend is running locally (port 5000)
- [ ] Set `REACT_APP_API_URL=http://localhost:5000/api`
- [ ] Set `REACT_APP_USE_MOCKS=false`
- [ ] Log in to get JWT token
- [ ] Verify token in localStorage: `localStorage.getItem('accessToken')`
- [ ] Dashboard should load real bookings from database
- [ ] Check browser console for errors
- [ ] Test booking detail page
- [ ] Test update/cancel operations

### Phase 3: API Mode (Production)
- [ ] Set `REACT_APP_API_URL=https://autosaaz-server.onrender.com/api`
- [ ] Set `REACT_APP_USE_MOCKS=false`
- [ ] Deploy to Vercel
- [ ] Log in to production app
- [ ] Verify JWT token stored
- [ ] Dashboard loads real data
- [ ] All CRUD operations work
- [ ] Check for CORS errors (should be none)

---

## Authentication Checklist

### Token Storage
- [ ] Login stores `accessToken` in localStorage
- [ ] Login stores `refreshToken` in localStorage (optional)
- [ ] Verify: `console.log(localStorage.getItem('accessToken'))`

### Token Usage
- [ ] All booking API calls include `Authorization` header
- [ ] Token format: `Bearer <token>`
- [ ] Check network tab in browser DevTools
- [ ] Request headers should show: `Authorization: Bearer eyJhbGc...`

### Token Expiration
- [ ] If 401 error, user redirected to login
- [ ] Token refresh logic implemented (if applicable)
- [ ] Clear localStorage on logout

---

## API Integration Checklist

### GET /api/bookings
- [ ] Returns array of bookings
- [ ] Filtered by garage_id (based on JWT)
- [ ] Maps to UI model correctly
- [ ] Displays in BookingSummary table

### GET /api/bookings/:id
- [ ] Returns single booking object
- [ ] All fields populated (phone, email, vehicle, etc.)
- [ ] Displays on BookingDetailPage
- [ ] Handles 404 gracefully

### PATCH /api/bookings/:id
- [ ] Updates booking successfully
- [ ] Returns updated booking object
- [ ] UI updates immediately
- [ ] Success notification shows

### DELETE /api/bookings/:id
- [ ] Deletes booking successfully
- [ ] Redirects to dashboard
- [ ] Success notification shows
- [ ] Booking removed from list

### GET /api/dashboard/stats
- [ ] Returns stats object
- [ ] Contains today/week/month/allTime
- [ ] (Optional) Display in dashboard

### GET /api/dashboard/booking-stats
- [ ] Returns booking statistics
- [ ] Contains totals and breakdown
- [ ] (Optional) Display in dashboard

---

## CORS Configuration

### Backend Must Allow:
```javascript
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'https://auto-saaz-garage-client.vercel.app',  // Production
  // Add any other domains
];
```

### Check CORS:
- [ ] Open browser DevTools → Network tab
- [ ] Look for failed requests with CORS error
- [ ] If CORS error, backend needs to add your domain to whitelist
- [ ] Test OPTIONS preflight requests

---

## Error Handling Checklist

### Network Errors
- [ ] API unreachable → Falls back to mock data
- [ ] Console shows warning: "API call failed, falling back to mock data"
- [ ] User sees data (even if mock)

### Authentication Errors
- [ ] 401 Unauthorized → User redirected to login
- [ ] Token missing → Shows login prompt
- [ ] Token expired → Refresh or redirect to login

### Validation Errors
- [ ] 400 Bad Request → Shows error message to user
- [ ] Error message displayed in notification
- [ ] User can retry operation

### Not Found Errors
- [ ] 404 on booking detail → "Booking not found" message
- [ ] "Back to Dashboard" button works
- [ ] Doesn't crash app

---

## UI/UX Verification

### BookingSummary Component
- [ ] Table displays correctly
- [ ] Columns: Booking ID | Customer | Service | Date | Status
- [ ] Status badges correct colors (in_progress, completed, cancelled)
- [ ] Click row → navigates to detail page
- [ ] Loading state shows spinner
- [ ] Error state shows message
- [ ] Empty state shows "No bookings found"

### BookingDetailPage Component
- [ ] Back button works
- [ ] Booking ID displays
- [ ] Customer name displays
- [ ] Service type displays
- [ ] Date displays (formatted)
- [ ] Time displays (if available)
- [ ] Status badge displays
- [ ] Phone displays (if available)
- [ ] Email displays (if available)
- [ ] Vehicle info displays (if available)
- [ ] Cost displays (if available)
- [ ] Payment status displays (if available)
- [ ] Technician displays (if available)
- [ ] Notes display (if available)
- [ ] Update button works
- [ ] Cancel button shows confirmation modal
- [ ] Cancel confirmation works

---

## Browser Console Checks

### No Errors
```javascript
// Should see no errors in console
// May see warnings about mock fallback (expected)
```

### Verify Environment
```javascript
console.log('API URL:', process.env.REACT_APP_API_URL);
// Should show: https://autosaaz-server.onrender.com/api

console.log('Use Mocks:', process.env.REACT_APP_USE_MOCKS);
// Should show: false (for API mode)
```

### Verify Auth
```javascript
console.log('Access Token:', localStorage.getItem('accessToken'));
// Should show JWT token string

console.log('Refresh Token:', localStorage.getItem('refreshToken'));
// Should show refresh token (if implemented)
```

### Test API Call
```javascript
// Manually test API
const token = localStorage.getItem('accessToken');
fetch('https://autosaaz-server.onrender.com/api/bookings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Bookings:', data))
.catch(err => console.error('Error:', err));
```

---

## Vercel Deployment

### Environment Variables (Vercel Dashboard)
- [ ] Navigate to Project Settings → Environment Variables
- [ ] Add: `REACT_APP_API_URL` = `https://autosaaz-server.onrender.com/api`
- [ ] Add: `REACT_APP_USE_MOCKS` = `false`
- [ ] Add: `REACT_APP_APP_NAME` = `AutoSaaz Garage App`
- [ ] Add: `CI` = `false`
- [ ] Add: `GENERATE_SOURCEMAP` = `false`
- [ ] Redeploy after adding variables

### Deployment
- [ ] Push to GitHub
- [ ] Vercel auto-deploys (if configured)
- [ ] OR manually deploy: `vercel --prod`
- [ ] Wait for deployment to complete
- [ ] Visit production URL
- [ ] Test login
- [ ] Test dashboard
- [ ] Test booking detail
- [ ] Test CRUD operations

---

## Performance Checks

### Load Time
- [ ] Dashboard loads in < 3 seconds
- [ ] Booking list displays quickly
- [ ] Detail page loads in < 2 seconds

### Network Requests
- [ ] Check Network tab in DevTools
- [ ] Bookings API called only once on dashboard load
- [ ] No unnecessary duplicate requests
- [ ] Images/assets load efficiently

### Error Recovery
- [ ] If API fails, falls back to mock data gracefully
- [ ] User doesn't see blank screen
- [ ] Console shows clear error messages
- [ ] Retry mechanism works (refetch button)

---

## Security Checks

### Authentication
- [ ] JWT token never exposed in URL
- [ ] Token stored securely in localStorage
- [ ] Token included in Authorization header only
- [ ] Sensitive data not logged to console (production)

### HTTPS
- [ ] Production uses HTTPS
- [ ] API uses HTTPS
- [ ] No mixed content warnings
- [ ] Secure cookies (if using refresh tokens)

### Data Validation
- [ ] User input sanitized
- [ ] No XSS vulnerabilities
- [ ] API responses validated before rendering
- [ ] Error messages don't expose sensitive info

---

## Final Verification

### ✅ All Features Working
- [ ] User can log in
- [ ] Dashboard displays bookings from database
- [ ] Booking detail page shows full information
- [ ] Update booking updates database
- [ ] Cancel booking deletes from database
- [ ] All UI looks identical to original mock version
- [ ] No visual changes to components
- [ ] Status badges correct colors
- [ ] Loading states work
- [ ] Error states work
- [ ] Notifications display properly

### ✅ Documentation Complete
- [ ] `BACKEND_BOOKING_INTEGRATION.md` reviewed
- [ ] `INTEGRATION_SUMMARY.md` reviewed
- [ ] Team understands how to toggle mock/API mode
- [ ] Team knows how to debug issues
- [ ] Environment variables documented

### ✅ Ready for Production
- [ ] All tests pass
- [ ] No console errors in production
- [ ] API endpoint verified and accessible
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] Deployment successful

---

## 🎉 Launch!

Once all items are checked:
1. Deploy to production
2. Monitor for errors
3. Test with real users
4. Collect feedback
5. Iterate and improve

---

## 🆘 Quick Troubleshooting

### Problem: Bookings not loading
**Solution:**
1. Check `REACT_APP_USE_MOCKS` = `false`
2. Verify API URL correct
3. Ensure JWT token in localStorage
4. Check backend CORS settings
5. Look for errors in browser console

### Problem: 401 Unauthorized
**Solution:**
1. Token might be expired → Log in again
2. Token format incorrect → Check `Bearer ${token}`
3. Backend not recognizing token → Verify JWT secret matches

### Problem: CORS error
**Solution:**
1. Backend must add your domain to allowed origins
2. Check preflight (OPTIONS) requests
3. Ensure backend sends proper CORS headers

### Problem: Data not displaying
**Solution:**
1. Check API response format matches mapper expectations
2. Verify field names match (customer_name vs customerName)
3. Check browser console for mapping errors
4. Test with mock data first

---

**Need Help?**
- Review `BACKEND_BOOKING_INTEGRATION.md` for detailed documentation
- Check browser console for errors
- Test with mock mode first (`REACT_APP_USE_MOCKS=true`)
- Verify environment variables in Vercel
- Contact backend team for API/CORS issues

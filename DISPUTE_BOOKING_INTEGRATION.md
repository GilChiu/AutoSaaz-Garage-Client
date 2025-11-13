# Dispute Booking Integration - Implementation Summary

## Overview
Added the ability to link disputes to specific bookings when creating a dispute in the Garage client. This allows garages to select which order/booking they're creating a dispute for, automatically pulling customer information from the booking.

## Changes Made

### 1. Backend - Edge Function (`resolution-center`)
**File:** `supabase/functions/resolution-center/index.ts`

#### POST /resolution-center (Create Dispute)
- Added `bookingId` parameter support
- If `bookingId` is provided, automatically fetch customer details from the booking:
  - `customer_name` → `contact_name`
  - `customer_email` → `contact_email`
- Stores `booking_id` in the disputes table
- Validates that the booking belongs to the authenticated garage (`garage_id` check)
- Backward compatible: `booking_id` is optional

#### GET /resolution-center (List Disputes)
- Updated to include booking information via join: `select('*, bookings(booking_number)')`
- Returns `orderId` field with the booking number
- Returns '—' if no booking is linked

#### GET /resolution-center/:id (Get Dispute Detail)
- Updated to include booking information
- Returns `orderId` field with the booking number

**Deployment Status:** ✅ Deployed (101.5kB bundle size)

### 2. Frontend - Service Layer
**File:** `src/services/resolutionCenter.service.js`

#### createDispute Function
Updated signature to accept `bookingId`:
```javascript
export async function createDispute({ subject, message, contactName, contactEmail, bookingId })
```
- Conditionally includes `bookingId` in the payload if provided
- Backward compatible: works without `bookingId`

### 3. Frontend - UI Component
**File:** `src/pages/ResolutionNewDisputesPage.jsx`

#### Added State Management
- `selectedBookingId`: Stores the selected booking UUID
- `bookings`: Array of available bookings
- `loadingBookings`: Loading state for bookings fetch

#### Added Bookings Fetch
- Fetches bookings when the "Create Dispute" modal opens
- Uses existing `getBookings` service with AbortController for cleanup
- Only fetches once (cached in state)

#### Updated Modal UI
Added booking dropdown before subject field:
```jsx
<select value={selectedBookingId} onChange={e => setSelectedBookingId(e.target.value)}>
  <option value="">Select a booking (optional)</option>
  {bookings.map(booking => (
    <option key={booking.id} value={booking.id}>
      {booking.bookingNumber} - {booking.customerName} ({booking.serviceName})
    </option>
  ))}
</select>
```

#### Updated Create Logic
- Passes `bookingId` to `createDispute` service if selected
- Clears `selectedBookingId` on cancel or successful creation

## Database Schema

### Existing Fields Used
The `disputes` table already has the `booking_id` column:
```sql
booking_id uuid null,
constraint disputes_booking_id_fkey foreign key (booking_id) 
  references bookings (id) on delete set null
```

### Bookings Table Fields Used
- `id` (uuid) - Primary key used for linking
- `booking_number` - Displayed in dropdown and dispute details
- `customer_name` - Auto-populated to dispute `contact_name`
- `customer_email` - Auto-populated to dispute `contact_email`
- `service_type` or similar - Shown in dropdown for context
- `garage_id` - Used to ensure booking belongs to the garage

## User Flow

### Creating a Dispute With Booking
1. Garage user clicks "New Dispute" button
2. Modal opens and automatically fetches garage's bookings
3. User selects a booking from dropdown (shows: `BK-1234 - John Doe (Oil Change)`)
4. Subject and message fields are filled as before
5. On submit:
   - Backend receives `bookingId`
   - Backend fetches customer details from booking
   - Dispute is created with `booking_id` link and auto-populated customer info

### Creating a Dispute Without Booking
1. User leaves dropdown on "Select a booking (optional)"
2. Fills subject and message as normal
3. Dispute is created without booking link (same as before)

## Benefits

### 1. Automatic Customer Information
- No need to manually enter customer name/email
- Guaranteed accuracy (pulled from booking record)
- Reduces data entry errors

### 2. Order Tracking
- Disputes are linked to specific orders
- Order ID visible in dispute list and detail views
- Easy to reference the original booking context

### 3. Better Context
- Admin can see which order the dispute relates to
- Customer information is accurate and up-to-date
- Streamlined dispute resolution process

## Backward Compatibility

✅ **Fully Backward Compatible**
- `booking_id` is optional in all endpoints
- Existing disputes without bookings continue to work
- Frontend gracefully handles missing booking data (shows '—')
- All existing functionality remains unchanged

## Testing Checklist

- [x] Edge Function deployed successfully
- [x] No syntax errors in frontend code
- [ ] Test creating dispute with booking selection
- [ ] Test creating dispute without booking selection
- [ ] Verify customer info auto-populates from booking
- [ ] Verify booking number shows in dispute list
- [ ] Verify booking number shows in dispute detail
- [ ] Test with existing disputes (no booking_id)
- [ ] Verify dropdown shows all garage bookings
- [ ] Verify only garage's own bookings are shown

## API Examples

### Create Dispute with Booking
```bash
POST /resolution-center
{
  "subject": "Incorrect charge on invoice",
  "message": "Was charged extra 200 AED",
  "bookingId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Create Dispute without Booking (Legacy)
```bash
POST /resolution-center
{
  "subject": "General inquiry",
  "message": "Need assistance",
  "contactName": "John Doe",
  "contactEmail": "john@example.com"
}
```

### Response (Both Cases)
```json
{
  "data": {
    "id": "uuid",
    "code": "DSP001",
    "disputeId": "uuid",
    "orderId": "BK-1234",  // or "—" if no booking
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "subject": "Incorrect charge on invoice",
    "raisedAt": "2025-11-13T...",
    "status": "open"
  }
}
```

## Notes

- The booking dropdown only loads when the modal opens (performance optimization)
- Loading state shows "Loading bookings..." while fetching
- Empty dropdown state handled gracefully
- All abort controllers properly cleanup on unmount
- No breaking changes to existing dispute functionality

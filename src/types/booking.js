/**
 * UI Booking Model (used by components)
 * @typedef {Object} Booking
 * @property {string} id - Unique booking identifier (e.g., "#1001" or "#BK1705318800001")
 * @property {string} customer - Customer name
 * @property {string} service - Service type
 * @property {string} date - Booking date in YYYY-MM-DD format
 * @property {'in_progress'|'completed'|'cancelled'} status - Booking status
 * @property {string} [phone] - Customer phone number
 * @property {string} [email] - Customer email
 * @property {string} [vehicle] - Vehicle information (make, model, year)
 * @property {string} [plateNumber] - Vehicle plate number
 * @property {number} [estimatedCost] - Estimated cost
 * @property {number} [actualCost] - Actual cost
 * @property {'pending'|'paid'|'partial'|'refunded'} [paymentStatus] - Payment status
 * @property {string} [scheduledTime] - Scheduled time
 * @property {string} [completionDate] - Completion date
 * @property {string} [assignedTechnician] - Assigned technician name
 * @property {string} [notes] - Customer-visible notes
 * @property {string} [internalNotes] - Internal notes (garage only)
 * @property {string} [bookingNumber] - Backend booking number (e.g., "BK1705318800001")
 */

/**
 * Backend API Booking Response (from server)
 * @typedef {Object} BookingApiResponse
 * @property {string} id - UUID
 * @property {string} booking_number - Formatted booking number (e.g., "BK1705318800001")
 * @property {string} garage_id - UUID of garage
 * @property {string} customer_name - Customer full name
 * @property {string} customer_phone - Customer phone number
 * @property {string} [customer_email] - Customer email (optional)
 * @property {string} service_type - Type of service
 * @property {string} [service_description] - Detailed service description
 * @property {string} booking_date - Date in YYYY-MM-DD format
 * @property {string} [scheduled_time] - Time in HH:MM format
 * @property {string} [vehicle_make] - Vehicle manufacturer
 * @property {string} [vehicle_model] - Vehicle model
 * @property {number} [vehicle_year] - Vehicle year
 * @property {string} [vehicle_plate_number] - Vehicle plate number
 * @property {number} [estimated_cost] - Estimated cost (decimal)
 * @property {number} [actual_cost] - Actual cost (decimal)
 * @property {'pending'|'confirmed'|'in_progress'|'completed'|'cancelled'|'no_show'} status
 * @property {'pending'|'paid'|'partial'|'refunded'} payment_status
 * @property {string} [completion_date] - ISO timestamp
 * @property {string} [assigned_technician] - Technician name
 * @property {string} [notes] - Customer-visible notes
 * @property {string} [internal_notes] - Internal notes
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * Dashboard Statistics (from backend)
 * @typedef {Object} DashboardStats
 * @property {Object} today - Today's statistics
 * @property {number} today.bookings - Number of bookings today
 * @property {number} today.revenue - Revenue today
 * @property {number} today.completed - Completed bookings today
 * @property {number} today.pending - Pending bookings today
 * @property {Object} week - This week's statistics
 * @property {number} week.bookings - Number of bookings this week
 * @property {number} week.revenue - Revenue this week
 * @property {number} week.completed - Completed bookings this week
 * @property {number} week.pending - Pending bookings this week
 * @property {Object} month - This month's statistics
 * @property {number} month.bookings - Number of bookings this month
 * @property {number} month.revenue - Revenue this month
 * @property {number} month.completed - Completed bookings this month
 * @property {number} month.pending - Pending bookings this month
 * @property {Object} allTime - All-time statistics
 * @property {number} allTime.bookings - Total bookings
 * @property {number} allTime.revenue - Total revenue
 * @property {number} allTime.completed - Total completed bookings
 * @property {number} allTime.pending - Total pending bookings
 */

/**
 * Booking Statistics (all-time)
 * @typedef {Object} BookingStats
 * @property {number} totalBookings - Total number of bookings
 * @property {number} completedBookings - Number of completed bookings
 * @property {number} cancelledBookings - Number of cancelled bookings
 * @property {number} pendingBookings - Number of pending bookings
 * @property {number} totalRevenue - Total revenue from all bookings
 * @property {number} averageBookingValue - Average value per booking
 * @property {Object} statusBreakdown - Breakdown by status
 * @property {number} statusBreakdown.pending
 * @property {number} statusBreakdown.confirmed
 * @property {number} statusBreakdown.in_progress
 * @property {number} statusBreakdown.completed
 * @property {number} statusBreakdown.cancelled
 * @property {number} statusBreakdown.no_show
 */

export {};

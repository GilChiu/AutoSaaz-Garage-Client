/**
 * Maps API booking response to UI booking model
 * @param {import('../../types/booking.js').BookingApiResponse} apiBooking
 * @param {number} index - Index for generating booking ID if not available
 * @returns {import('../../types/booking.js').Booking}
 */
export function mapApiBookingToBooking(apiBooking, index = 0) {
  // Format vehicle information
  const vehicle = [
    apiBooking.vehicle_make,
    apiBooking.vehicle_model,
    apiBooking.vehicle_year
  ].filter(Boolean).join(' ');

  return {
    // Core fields (required by UI table)
    id: apiBooking.booking_number 
      ? `#${apiBooking.booking_number}` 
      : (apiBooking.id ? `#${apiBooking.id}` : `#${1001 + index}`),
    customer: apiBooking.customerName || apiBooking.customer_name,
    service: apiBooking.serviceType || apiBooking.service_type,
    date: apiBooking.appointmentDate || apiBooking.appointment_date || apiBooking.booking_date,
    status: mapApiStatusToUiStatus(apiBooking.status),
    
    // Extended fields (for detail view)
    uuid: apiBooking.id, // Original UUID for API calls
    phone: apiBooking.customer_phone,
    email: apiBooking.customer_email,
    vehicle: vehicle || undefined,
    plateNumber: apiBooking.vehicle_plate_number,
    estimatedCost: apiBooking.estimated_cost,
    actualCost: apiBooking.actual_cost,
    paymentStatus: apiBooking.payment_status,
    scheduledTime: apiBooking.scheduled_time,
    completionDate: apiBooking.completion_date,
    assignedTechnician: apiBooking.assigned_technician,
    notes: apiBooking.notes,
    internalNotes: apiBooking.internal_notes,
    bookingNumber: apiBooking.booking_number,
    customerName: apiBooking.customer_name, // Add this for dropdown display
    serviceName: apiBooking.service_type, // Add this for dropdown display
  };
}

/**
 * Maps API status to UI status
 * Backend statuses: pending, confirmed, in_progress, completed, cancelled, no_show
 * UI statuses: in_progress, completed, cancelled
 * @param {'pending'|'confirmed'|'in_progress'|'completed'|'cancelled'|'no_show'} apiStatus
 * @returns {'in_progress'|'completed'|'cancelled'}
 */
export function mapApiStatusToUiStatus(apiStatus) {
  switch (apiStatus?.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'cancelled':
    case 'no_show':
      return 'cancelled';
    case 'pending':
    case 'confirmed':
    case 'in_progress':
    default:
      return 'in_progress';
  }
}

/**
 * Gets display text for status
 * @param {'in_progress'|'completed'|'cancelled'} status
 * @returns {string}
 */
export function getStatusDisplayText(status) {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    case 'in_progress':
    default:
      return 'In Progress';
  }
}

/**
 * Gets CSS class for status badge
 * @param {'in_progress'|'completed'|'cancelled'} status
 * @returns {string}
 */
export function getStatusCssClass(status) {
  switch (status) {
    case 'completed':
      return 'status-completed';
    case 'cancelled':
      return 'status-cancelled';
    case 'in_progress':
    default:
      return 'status-in-progress';
  }
}

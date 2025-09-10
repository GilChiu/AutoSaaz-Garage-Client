/**
 * Maps API booking response to UI booking model
 * @param {import('../../types/booking.js').BookingApiResponse} apiBooking
 * @param {number} index - Index for generating booking ID if not available
 * @returns {import('../../types/booking.js').Booking}
 */
export function mapApiBookingToBooking(apiBooking, index = 0) {
  return {
    id: apiBooking.id ? `#${apiBooking.id}` : `#${1001 + index}`,
    customer: apiBooking.customerName || apiBooking.customer_name,
    service: apiBooking.serviceType || apiBooking.service_type,
    date: apiBooking.appointmentDate || apiBooking.appointment_date,
    status: mapApiStatusToUiStatus(apiBooking.status)
  };
}

/**
 * Maps API status to UI status
 * @param {'pending'|'confirmed'|'cancelled'|'completed'} apiStatus
 * @returns {'in_progress'|'completed'|'cancelled'}
 */
export function mapApiStatusToUiStatus(apiStatus) {
  switch (apiStatus?.toLowerCase()) {
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
    case 'confirmed':
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

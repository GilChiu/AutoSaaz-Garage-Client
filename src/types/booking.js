/**
 * @typedef {Object} Booking
 * @property {string} id - Unique booking identifier
 * @property {string} customer - Customer name
 * @property {string} service - Service type
 * @property {string} date - Booking date in YYYY-MM-DD format
 * @property {'in_progress'|'completed'} status - Booking status
 */

/**
 * @typedef {Object} BookingApiResponse
 * @property {string} id
 * @property {string} customer_name
 * @property {string} service_type
 * @property {string} appointment_date
 * @property {'pending'|'confirmed'|'completed'} status
 */

export {};

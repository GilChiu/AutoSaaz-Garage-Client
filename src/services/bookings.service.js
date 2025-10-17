import { mapApiBookingToBooking } from './mappers/bookingMappers.js';

/**
 * API base URL from environment
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://auto-saaz-server.onrender.com/api';

/**
 * Gets authentication token from localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('accessToken') || localStorage.getItem('token');
}

/**
 * Creates headers with authentication
 * @returns {HeadersInit}
 */
function getHeaders() {
  const token = getAuthToken();
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

/**
 * Fetches bookings from API
 * @param {AbortSignal} [signal] - AbortController signal for request cancellation
 * @param {Object} [params] - Query parameters for filtering
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.startDate] - Filter by start date
 * @param {string} [params.endDate] - Filter by end date
 * @param {number} [params.page] - Page number for pagination
 * @param {number} [params.limit] - Items per page
 * @returns {Promise<import('../types/booking.js').Booking[]>}
 */
export async function getBookings(signal, params = {}) {
  try {
    console.log('=== FETCHING BOOKINGS FROM API ===');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('date_from', params.startDate);
    if (params.endDate) queryParams.append('date_to', params.endDate);
    if (params.page) queryParams.append('offset', ((params.page - 1) * (params.limit || 50)).toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/bookings${queryString ? `?${queryString}` : ''}`;

    console.log('API URL:', url);
    console.log('Headers:', getHeaders());

    const response = await fetch(url, {
      headers: getHeaders(),
      signal
    });

    console.log('Response Status:', response.status);
    console.log('Response OK:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    // Handle both array response and paginated response
    const apiBookings = Array.isArray(result.data) ? result.data : (result.data?.bookings || []);
    
    console.log('Raw API Bookings:', apiBookings);
    
    // Map API response to UI model
    const mappedBookings = apiBookings.map((booking, index) => 
      mapApiBookingToBooking(booking, index)
    );
    
    console.log('Mapped Bookings:', mappedBookings);
    console.log('=== BOOKINGS FETCH SUCCESS ===');
    
    return mappedBookings;

  } catch (error) {
    console.error('=== BOOKINGS FETCH ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    if (error.name === 'AbortError') {
      throw error; // Don't handle aborted requests
    }
    
    // Re-throw the error - no fallback to mock data
    throw new Error(`Failed to fetch bookings: ${error.message}`);
  }
}

/**
 * Fetches a single booking by ID
 * @param {string} id - Booking ID (can be UUID or booking_number)
 * @param {AbortSignal} [signal] - AbortController signal
 * @returns {Promise<import('../types/booking.js').Booking|null>}
 */
export async function getBookingById(id, signal) {
  try {
    console.log('=== FETCHING BOOKING BY ID ===', id);
    
    const cleanId = id.replace('#', '');
    const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      headers: getHeaders(),
      signal
    });

    console.log('Response Status:', response.status);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiBooking = result.data || result.booking || result;
    
    console.log('=== BOOKING FETCH SUCCESS ===');
    return mapApiBookingToBooking(apiBooking);

  } catch (error) {
    console.error('=== BOOKING FETCH ERROR ===');
    console.error('Error:', error.message);
    
    if (error.name === 'AbortError') {
      throw error;
    }
    
    throw new Error(`Failed to fetch booking: ${error.message}`);
  }
}

/**
 * Creates a new booking
 * @param {Object} bookingData - Booking data to create
 * @returns {Promise<import('../types/booking.js').Booking>}
 */
export async function createBooking(bookingData) {
  try {
    console.log('=== CREATING BOOKING ===', bookingData);
    
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiBooking = result.data || result.booking || result;
    
    console.log('=== BOOKING CREATED ===');
    return mapApiBookingToBooking(apiBooking);

  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
}

/**
 * Updates an existing booking
 * @param {string} id - Booking ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<import('../types/booking.js').Booking>}
 */
export async function updateBooking(id, updates) {
  try {
    console.log('=== UPDATING BOOKING ===', id, updates);
    
    const cleanId = id.replace('#', '');
    const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiBooking = result.data || result.booking || result;
    
    console.log('=== BOOKING UPDATED ===');
    return mapApiBookingToBooking(apiBooking);

  } catch (error) {
    console.error('Failed to update booking:', error);
    throw error;
  }
}

/**
 * Deletes/cancels a booking
 * @param {string} id - Booking ID
 * @returns {Promise<boolean>}
 */
export async function deleteBooking(id) {
  try {
    console.log('=== DELETING BOOKING ===', id);
    
    const cleanId = id.replace('#', '');
    const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    console.log('=== BOOKING DELETED ===');
    return true;

  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw error;
  }
}

/**
 * Fetches dashboard statistics
 * @returns {Promise<import('../types/booking.js').DashboardStats>}
 */
export async function getDashboardStats() {
  try {
    console.log('=== FETCHING DASHBOARD STATS ===');
    
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('=== DASHBOARD STATS SUCCESS ===');
    return result.data || result.stats || result;

  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error.message);
    throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
  }
}

/**
 * Fetches all-time booking statistics
 * @returns {Promise<import('../types/booking.js').BookingStats>}
 */
export async function getBookingStats() {
  try {
    console.log('=== FETCHING BOOKING STATS ===');
    
    const response = await fetch(`${API_BASE_URL}/dashboard/booking-stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('=== BOOKING STATS SUCCESS ===');
    return result.data || result.stats || result;

  } catch (error) {
    console.error('Failed to fetch booking stats:', error.message);
    throw new Error(`Failed to fetch booking statistics: ${error.message}`);
  }
}

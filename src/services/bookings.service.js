import { mapApiBookingToBooking } from './mappers/bookingMappers.js';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

/**
 * API base URL from environment
 */
const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

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
  const headers = {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  if (token) headers['x-access-token'] = token;
  return headers;
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
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('date_from', params.startDate);
    if (params.endDate) queryParams.append('date_to', params.endDate);
    if (params.page) queryParams.append('offset', ((params.page - 1) * (params.limit || 50)).toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/bookings${queryString ? `?${queryString}` : ''}`;
    
    // Check cache first (skip if aborted)
    if (!signal?.aborted) {
      const cached = cache.get(endpoint);
      if (cached) {
        return cached;
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;

    // Use retry logic for resilience
    const result = await retryApiCall(async () => {
      const response = await fetch(url, {
        headers: getHeaders(),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }, `GET ${endpoint}`);
    
    // Handle both array response and paginated response
    const apiBookings = Array.isArray(result.data) ? result.data : (result.data?.bookings || []);
    
    // Map API response to UI model
    const mappedBookings = apiBookings.map((booking, index) => 
      mapApiBookingToBooking(booking, index)
    );
    
    // Cache the mapped results
    cache.set(endpoint, {}, mappedBookings);
    
    return mappedBookings;

  } catch (error) {
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
    const cleanId = id.replace('#', '');
    const endpoint = `/bookings/${cleanId}`;
    
    // Check cache first
    if (!signal?.aborted) {
      const cached = cache.get(endpoint);
      if (cached) {
        return cached;
      }
    }
    
    // Use retry logic for resilience
    const result = await retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
        signal
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }, `GET ${endpoint}`);
    
    if (result === null) {
      return null;
    }
    
    const apiBooking = result.data || result.booking || result;
    const mappedBooking = mapApiBookingToBooking(apiBooking);
    
    // Cache the result
    cache.set(endpoint, {}, mappedBooking);
    
    return mappedBooking;

  } catch (error) {
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
    
    // Invalidate bookings cache after creation
    cache.invalidatePattern('bookings');
    cache.invalidatePattern('dashboard');
    
    return mapApiBookingToBooking(apiBooking);

  } catch (error) {
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
    
    // Invalidate bookings cache after update
    cache.invalidatePattern('bookings');
    cache.invalidate(`/bookings/${cleanId}`);
    cache.invalidatePattern('dashboard');
    
    return mapApiBookingToBooking(apiBooking);

  } catch (error) {
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
    const cleanId = id.replace('#', '');
  const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Invalidate bookings cache after deletion
    cache.invalidatePattern('bookings');
    cache.invalidate(`/bookings/${cleanId}`);
    cache.invalidatePattern('dashboard');

    return true;

  } catch (error) {
    throw error;
  }
}

/**
 * Fetches dashboard statistics
 * @returns {Promise<import('../types/booking.js').DashboardStats>}
 */
export async function getDashboardStats() {
  try {
    const endpoint = '/dashboard/stats';
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) {
      return cached;
    }
    
    // Use retry logic for resilience
    const result = await retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }, `GET ${endpoint}`);
    
    const stats = result.data || result.stats || result;
    
    // Cache the result
    cache.set(endpoint, {}, stats);
    
    return stats;

  } catch (error) {
    throw new Error(`Failed to fetch dashboard statistics: ${error.message}`);
  }
}

/**
 * Fetches all-time booking statistics
 * @returns {Promise<import('../types/booking.js').BookingStats>}
 */
export async function getBookingStats() {
  try {
    const endpoint = '/dashboard/booking-stats';
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) {
      return cached;
    }
    
    // Use retry logic for resilience
    const result = await retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    }, `GET ${endpoint}`);
    
    const stats = result.data || result.stats || result;
    
    // Cache the result
    cache.set(endpoint, {}, stats);
    
    return stats;

  } catch (error) {
    throw new Error(`Failed to fetch booking statistics: ${error.message}`);
  }
}

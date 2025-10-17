import mockBookings from '../mocks/bookings.json';
import { mapApiBookingToBooking } from './mappers/bookingMappers.js';
import DEV_CONFIG from '../config/dev.js';

/**
 * Environment flag to use mocks instead of API
 */
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true' || !DEV_CONFIG.ENABLE_AUTH;

/**
 * API base URL from environment
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
 * Fetches bookings from API or returns mock data
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
  // If mocks are enabled or auth is disabled, return mock data
  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        const mappedBookings = mockBookings.map((booking, index) => 
          mapApiBookingToBooking(booking, index)
        );
        resolve(mappedBookings);
      }, 500); // Simulate network delay
    });
  }

  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/bookings${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: getHeaders(),
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Handle both array response and paginated response
    const apiBookings = Array.isArray(result) ? result : (result.data || result.bookings || []);
    
    // Map API response to UI model
    return apiBookings.map((booking, index) => 
      mapApiBookingToBooking(booking, index)
    );

  } catch (error) {
    // On any error (network, 401, 500, etc.), fall back to mocks if available
    if (error.name === 'AbortError') {
      throw error; // Don't handle aborted requests
    }
    
    console.warn('API call failed, falling back to mock data:', error.message);
    
    // Return mock data as fallback
    return mockBookings.map((booking, index) => 
      mapApiBookingToBooking(booking, index)
    );
  }
}

/**
 * Fetches a single booking by ID
 * @param {string} id - Booking ID (can be UUID or booking_number)
 * @param {AbortSignal} [signal] - AbortController signal
 * @returns {Promise<import('../types/booking.js').Booking|null>}
 */
export async function getBookingById(id, signal) {
  // If mocks are enabled, find in mock data
  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        const cleanId = id.replace('#', '');
        const booking = mockBookings.find(b => 
          b.id.toString() === cleanId || b.id === parseInt(cleanId)
        );
        resolve(booking ? mapApiBookingToBooking(booking) : null);
      }, 500);
    });
  }

  try {
    const cleanId = id.replace('#', '');
    const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      headers: getHeaders(),
      signal
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiBooking = result.data || result.booking || result;
    
    return mapApiBookingToBooking(apiBooking);

  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.warn('API call failed, falling back to mock data:', error.message);
    
    // Fallback to mock data
    const cleanId = id.replace('#', '');
    const booking = mockBookings.find(b => 
      b.id.toString() === cleanId || b.id === parseInt(cleanId)
    );
    return booking ? mapApiBookingToBooking(booking) : null;
  }
}

/**
 * Creates a new booking
 * @param {Object} bookingData - Booking data to create
 * @returns {Promise<import('../types/booking.js').Booking>}
 */
export async function createBooking(bookingData) {
  if (USE_MOCKS) {
    // Mock creation - just return the data with a fake ID
    return new Promise(resolve => {
      setTimeout(() => {
        const mockBooking = {
          ...bookingData,
          id: Date.now(),
          status: 'pending',
        };
        resolve(mapApiBookingToBooking(mockBooking));
      }, 500);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiBooking = result.data || result.booking || result;
    
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
  if (USE_MOCKS) {
    // Mock update - just return the updated data
    return new Promise(resolve => {
      setTimeout(() => {
        const cleanId = id.replace('#', '');
        const booking = mockBookings.find(b => b.id.toString() === cleanId);
        const updated = { ...booking, ...updates };
        resolve(mapApiBookingToBooking(updated));
      }, 500);
    });
  }

  try {
    const cleanId = id.replace('#', '');
    const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiBooking = result.data || result.booking || result;
    
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
  if (USE_MOCKS) {
    // Mock delete - just return success
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  try {
    const cleanId = id.replace('#', '');
    const response = await fetch(`${API_BASE_URL}/bookings/${cleanId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

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
  if (USE_MOCKS) {
    // Return mock statistics
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          today: {
            bookings: 3,
            revenue: 450,
            completed: 1,
            pending: 2,
          },
          week: {
            bookings: 12,
            revenue: 2340,
            completed: 7,
            pending: 5,
          },
          month: {
            bookings: 45,
            revenue: 8920,
            completed: 32,
            pending: 13,
          },
          allTime: {
            bookings: mockBookings.length,
            revenue: 15600,
            completed: mockBookings.filter(b => b.status === 'completed').length,
            pending: mockBookings.filter(b => b.status === 'pending').length,
          }
        });
      }, 500);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result.stats || result;

  } catch (error) {
    console.warn('Failed to fetch dashboard stats:', error.message);
    
    // Return mock stats as fallback
    return {
      today: { bookings: 0, revenue: 0, completed: 0, pending: 0 },
      week: { bookings: 0, revenue: 0, completed: 0, pending: 0 },
      month: { bookings: 0, revenue: 0, completed: 0, pending: 0 },
      allTime: { bookings: 0, revenue: 0, completed: 0, pending: 0 },
    };
  }
}

/**
 * Fetches all-time booking statistics
 * @returns {Promise<import('../types/booking.js').BookingStats>}
 */
export async function getBookingStats() {
  if (USE_MOCKS) {
    // Return mock booking stats
    return new Promise(resolve => {
      setTimeout(() => {
        const total = mockBookings.length;
        const completed = mockBookings.filter(b => b.status === 'completed').length;
        const cancelled = mockBookings.filter(b => b.status === 'cancelled').length;
        const pending = mockBookings.filter(b => b.status === 'pending').length;
        
        resolve({
          totalBookings: total,
          completedBookings: completed,
          cancelledBookings: cancelled,
          pendingBookings: pending,
          totalRevenue: 15600,
          averageBookingValue: total > 0 ? 15600 / total : 0,
          statusBreakdown: {
            pending,
            confirmed: 0,
            in_progress: 0,
            completed,
            cancelled,
            no_show: 0,
          }
        });
      }, 500);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/dashboard/booking-stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result.stats || result;

  } catch (error) {
    console.warn('Failed to fetch booking stats:', error.message);
    
    // Return empty stats as fallback
    return {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
      averageBookingValue: 0,
      statusBreakdown: {
        pending: 0,
        confirmed: 0,
        in_progress: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0,
      }
    };
  }
}

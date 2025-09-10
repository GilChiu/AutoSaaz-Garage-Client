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
 * Fetches bookings from API or returns mock data
 * @param {AbortSignal} [signal] - AbortController signal for request cancellation
 * @returns {Promise<import('../types/booking.js').Booking[]>}
 */
export async function getBookings(signal) {
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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiBookings = await response.json();
    
    // Map API response to UI model
    return apiBookings.data?.map((booking, index) => 
      mapApiBookingToBooking(booking, index)
    ) || [];

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

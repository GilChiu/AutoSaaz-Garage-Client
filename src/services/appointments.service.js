/**
 * AutoSaaz Appointments API Service
 * Handles appointment management with production-ready real API calls
 */

import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

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
 * Fetches appointments from API
 * @param {AbortSignal} signal - AbortController signal for request cancellation
 * @param {Object} params - Query parameters for filtering
 * @returns {Promise<Array>}
 */
export async function getAppointments(signal, params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.service_type) queryParams.append('service_type', params.service_type);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.search) queryParams.append('search', params.search);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
    
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
    const apiAppointments = Array.isArray(result.data) ? result.data : (result.data?.appointments || []);
    
    // Cache the result
    cache.set(endpoint, {}, apiAppointments);
    
    return apiAppointments;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Don't handle aborted requests
    }
    
    // Re-throw the error - no fallback to mock data
    throw new Error(`Failed to fetch appointments: ${error.message}`);
  }
}

/**
 * Fetches a single appointment by ID
 * @param {string} id - Appointment ID
 * @param {AbortSignal} signal - AbortController signal
 * @returns {Promise<Object|null>}
 */
export async function getAppointmentById(id, signal) {
  try {
    const endpoint = `/appointments/${id}`;
    
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
    
    const appointment = result.data || result;
    
    // Cache the result
    cache.set(endpoint, {}, appointment);
    
    return appointment;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    
    throw new Error(`Failed to fetch appointment: ${error.message}`);
  }
}

/**
 * Updates an existing appointment
 * @param {string} id - Appointment ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object>}
 */
export async function updateAppointment(id, updateData) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const appointment = result.data || result;
    
    // Invalidate appointments cache after update
    cache.invalidatePattern('appointments');
    cache.invalidate(`/appointments/${id}`);
    cache.invalidatePattern('dashboard');
    
    return appointment;

  } catch (error) {
    throw error;
  }
}

/**
 * Creates a new appointment
 * @param {Object} appointmentData - Appointment data to create
 * @returns {Promise<Object>}
 */
export async function createAppointment(appointmentData) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const appointment = result.data || result;
    
    // Invalidate appointments cache after creation
    cache.invalidatePattern('appointments');
    cache.invalidatePattern('dashboard');
    
    return appointment;

  } catch (error) {
    throw error;
  }
}

/**
 * Deletes an appointment
 * @param {string} id - Appointment ID
 * @returns {Promise<boolean>}
 */
export async function deleteAppointment(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    // Invalidate appointments cache after deletion
    cache.invalidatePattern('appointments');
    cache.invalidate(`/appointments/${id}`);
    cache.invalidatePattern('dashboard');

    return true;

  } catch (error) {
    throw error;
  }
}

/**
 * Mapping helpers to keep UI decoupled from API structure
 */
export function mapAppointment(raw) {
  // Handle both legacy mock format and new API format
  const customer = raw.customerName || raw.customer_name;
  const serviceType = raw.serviceType || raw.service_type;
  const appointmentDate = raw.appointmentDate || raw.appointment_date;
  
  // Handle vehicle info
  let vehicleLabel = '';
  if (raw.vehicle) {
    // Legacy mock format
    vehicleLabel = `${raw.vehicle.make} ${raw.vehicle.model} (${raw.vehicle.year})`;
  } else if (raw.vehicle_make || raw.vehicle_model || raw.vehicle_year) {
    // New API format
    const parts = [];
    if (raw.vehicle_make) parts.push(raw.vehicle_make);
    if (raw.vehicle_model) parts.push(raw.vehicle_model);
    if (raw.vehicle_year) parts.push(`(${raw.vehicle_year})`);
    vehicleLabel = parts.join(' ');
  } else {
    vehicleLabel = 'Vehicle not specified';
  }
  
  return {
    id: raw.id,
    customer: customer,
    vehicleLabel: vehicleLabel,
    service: serviceType,
    date: appointmentDate,
    status: raw.status, // pending | confirmed | cancelled
    priority: raw.priority // high | normal
  };
}

export function mapDetailedAppointment(raw) {
  if (!raw) return null;
  return {
    ...mapAppointment(raw),
    vehicle: raw.vehicle || {
      make: raw.vehicle_make,
      model: raw.vehicle_model,
      year: raw.vehicle_year,
      plate: raw.vehicle_plate_number
    },
    raw // keep original reference for future extension
  };
}

/**
 * Accept/Confirm an appointment
 * @param {string} id - Appointment ID
 * @returns {Promise<Object>}
 */
export async function acceptAppointment(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/accept`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const appointment = result.data || result;
    
    return appointment;

  } catch (error) {
    throw error;
  }
}

/**
 * Cancel an appointment
 * @param {string} id - Appointment ID
 * @returns {Promise<Object>}
 */
export async function cancelAppointment(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/appointments/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const appointment = result.data || result;
    
    return appointment;

  } catch (error) {
    throw error;
  }
}

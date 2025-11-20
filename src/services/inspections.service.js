import { mapApiInspectionToInspection } from './mappers/inspectionMappers.js';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

/**
 * API base URL from environment
 */
// Prefer Supabase Functions URL when available; fallback to legacy API if explicitly configured
const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL || process.env.REACT_APP_API_URL || 'https://auto-saaz-server.onrender.com/api';

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
    'Content-Type': 'application/json',
  };
  // If we're targeting Supabase Functions, include anon key + x-access-token
  if (API_BASE_URL.includes('.functions.supabase.co')) {
    headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    if (token) headers['x-access-token'] = token;
  } else {
    // Legacy server compatibility
    headers['Authorization'] = token ? `Bearer ${token}` : '';
  }
  return headers;
}

/**
 * Fetches inspections from API
 * @param {AbortSignal} [signal] - AbortController signal for request cancellation
 * @param {Object} [params] - Query parameters for filtering
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.priority] - Filter by priority
 * @param {string} [params.assigned_technician] - Filter by technician
 * @param {string} [params.date_from] - Filter by start date
 * @param {string} [params.date_to] - Filter by end date
 * @param {number} [params.page] - Page number for pagination
 * @param {number} [params.limit] - Items per page
 * @returns {Promise<import('../types/inspection.js').Inspection[]>}
 */
export async function getInspections(signal, params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.assigned_technician) queryParams.append('assigned_technician', params.assigned_technician);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.page) queryParams.append('offset', ((params.page - 1) * (params.limit || 50)).toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/inspections${queryString ? `?${queryString}` : ''}`;
    
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
    const apiInspections = Array.isArray(result.data) ? result.data : (result.data?.inspections || []);
    
    // Map API response to UI model
    const mappedInspections = apiInspections.map((inspection, index) => 
      mapApiInspectionToInspection(inspection, index)
    );
    
    // Cache the mapped results
    cache.set(endpoint, {}, mappedInspections);
    
    return mappedInspections;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Don't handle aborted requests
    }
    
    // Re-throw the error - no fallback to mock data
    throw new Error(`Failed to fetch inspections: ${error.message}`);
  }
}

/**
 * Fetches a single inspection by ID
 * @param {string|number} id - Inspection ID (can be UUID or inspection_number)
 * @param {AbortSignal} [signal] - AbortController signal
 * @returns {Promise<import('../types/inspection.js').Inspection|null>}
 */
export async function getInspectionById(id, signal) {
  try {
    const cleanId = id.toString().replace('#', '');
    const endpoint = `/inspections/${cleanId}`;
    
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
    
    const apiInspection = result.data || result.inspection || result;
    const mappedInspection = mapApiInspectionToInspection(apiInspection);
    
    // Cache the result
    cache.set(endpoint, {}, mappedInspection);
    
    return mappedInspection;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    
    throw new Error(`Failed to fetch inspection: ${error.message}`);
  }
}

/**
 * Creates a new inspection
 * @param {Object} inspectionData - Inspection data to create
 * @returns {Promise<import('../types/inspection.js').Inspection>}
 */
export async function createInspection(inspectionData) {
  try {
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(inspectionData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiInspection = result.data || result.inspection || result;
    
    // Invalidate inspections cache after creation
    cache.invalidatePattern('inspections');
    cache.invalidatePattern('dashboard');
    
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    throw error;
  }
}

/**
 * Updates an existing inspection
 * @param {string|number} id - Inspection ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<import('../types/inspection.js').Inspection>}
 */
export async function updateInspection(id, updates) {
  try {
    const cleanId = id.toString().replace('#', '');
    const response = await fetch(`${API_BASE_URL}/inspections/${cleanId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiInspection = result.data || result.inspection || result;
    
    // Invalidate inspections cache after update
    cache.invalidatePattern('inspections');
    cache.invalidate(`/inspections/${cleanId}`);
    cache.invalidatePattern('dashboard');
    
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    throw error;
  }
}

/**
 * Deletes/cancels an inspection
 * @param {string|number} id - Inspection ID
 * @returns {Promise<boolean>}
 */
export async function deleteInspection(id) {
  try {
    const cleanId = id.toString().replace('#', '');
    const response = await fetch(`${API_BASE_URL}/inspections/${cleanId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return true;

  } catch (error) {
    throw error;
  }
}

/**
 * Marks an inspection as completed
 * @param {string|number} id - Inspection ID
 * @param {Object} completionData - Completion data (findings, recommendations, actual_cost)
 * @returns {Promise<import('../types/inspection.js').Inspection>}
 */
export async function completeInspection(id, completionData) {
  try {
    const cleanId = id.toString().replace('#', '');
    const response = await fetch(`${API_BASE_URL}/inspections/${cleanId}/complete`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(completionData),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const apiInspection = result.data || result.inspection || result;
    
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    throw error;
  }
}

/**
 * Fetches inspection statistics
 * @returns {Promise<import('../types/inspection.js').InspectionStats>}
 */
export async function getInspectionStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/inspections/stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data || result.stats || result;

  } catch (error) {
    throw new Error(`Failed to fetch inspection statistics: ${error.message}`);
  }
}

import { mapApiInspectionToInspection } from './mappers/inspectionMappers.js';

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
    console.log('=== FETCHING INSPECTIONS FROM API ===');
    
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
    const url = `${API_BASE_URL}/inspections${queryString ? `?${queryString}` : ''}`;

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
    const apiInspections = Array.isArray(result.data) ? result.data : (result.data?.inspections || []);
    
    console.log('Raw API Inspections:', apiInspections);
    
    // Map API response to UI model
    const mappedInspections = apiInspections.map((inspection, index) => 
      mapApiInspectionToInspection(inspection, index)
    );
    
    console.log('Mapped Inspections:', mappedInspections);
    console.log('=== INSPECTIONS FETCH SUCCESS ===');
    
    return mappedInspections;

  } catch (error) {
    console.error('=== INSPECTIONS FETCH ERROR ===');
    console.error('Error Type:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
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
    console.log('=== FETCHING INSPECTION BY ID ===', id);
    
    const cleanId = id.toString().replace('#', '');
    const response = await fetch(`${API_BASE_URL}/inspections/${cleanId}`, {
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
    const apiInspection = result.data || result.inspection || result;
    
    console.log('=== INSPECTION FETCH SUCCESS ===');
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    console.error('=== INSPECTION FETCH ERROR ===');
    console.error('Error:', error.message);
    
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
    console.log('=== CREATING INSPECTION ===', inspectionData);
    
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
    
    console.log('=== INSPECTION CREATED ===');
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    console.error('Failed to create inspection:', error);
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
    console.log('=== UPDATING INSPECTION ===', id, updates);
    
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
    
    console.log('=== INSPECTION UPDATED ===');
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    console.error('Failed to update inspection:', error);
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
    console.log('=== DELETING INSPECTION ===', id);
    
    const cleanId = id.toString().replace('#', '');
    const response = await fetch(`${API_BASE_URL}/inspections/${cleanId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    console.log('=== INSPECTION DELETED ===');
    return true;

  } catch (error) {
    console.error('Failed to delete inspection:', error);
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
    console.log('=== COMPLETING INSPECTION ===', id, completionData);
    
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
    
    console.log('=== INSPECTION COMPLETED ===');
    return mapApiInspectionToInspection(apiInspection);

  } catch (error) {
    console.error('Failed to complete inspection:', error);
    throw error;
  }
}

/**
 * Fetches inspection statistics
 * @returns {Promise<import('../types/inspection.js').InspectionStats>}
 */
export async function getInspectionStats() {
  try {
    console.log('=== FETCHING INSPECTION STATS ===');
    
    const response = await fetch(`${API_BASE_URL}/inspections/stats`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('=== INSPECTION STATS SUCCESS ===');
    return result.data || result.stats || result;

  } catch (error) {
    console.error('Failed to fetch inspection stats:', error.message);
    throw new Error(`Failed to fetch inspection statistics: ${error.message}`);
  }
}

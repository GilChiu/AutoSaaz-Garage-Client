import mockInspections from '../mocks/inspections.json';
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
 * Fetches inspections from API or returns mock data
 * @param {AbortSignal} [signal] - AbortController signal for request cancellation
 * @returns {Promise<Array>}
 */
export async function getInspections(signal) {
  // If mocks are enabled or auth is disabled, return mock data
  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(mockInspections);
      }, 500); // Simulate network delay
    });
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/inspections`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiInspections = await response.json();
    return apiInspections.data || [];

  } catch (error) {
    // On any error (network, 401, 500, etc.), fall back to mocks if available
    if (error.name === 'AbortError') {
      throw error; // Don't handle aborted requests
    }
    
    console.warn('API call failed, falling back to mock data:', error.message);
    return mockInspections;
  }
}

/**
 * Fetches a single inspection by ID
 * @param {string|number} id - Inspection ID
 * @param {AbortSignal} [signal] - AbortController signal for request cancellation
 * @returns {Promise<Object|null>}
 */
export async function getInspectionById(id, signal) {
  // If mocks are enabled or auth is disabled, return mock data
  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        const inspection = mockInspections.find(inspection => 
          inspection.id === parseInt(id)
        );
        resolve(inspection || null);
      }, 300);
    });
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      signal
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiInspection = await response.json();
    return apiInspection.data || null;

  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    
    console.warn('API call failed, falling back to mock data:', error.message);
    const inspection = mockInspections.find(inspection => 
      inspection.id === parseInt(id)
    );
    return inspection || null;
  }
}

/**
 * Updates inspection status to completed
 * @param {string|number} id - Inspection ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>}
 */
export async function updateInspection(id, updateData) {
  // If mocks are enabled or auth is disabled, simulate update
  if (USE_MOCKS) {
    return new Promise(resolve => {
      setTimeout(() => {
        const inspectionIndex = mockInspections.findIndex(inspection => 
          inspection.id === parseInt(id)
        );
        
        if (inspectionIndex !== -1) {
          mockInspections[inspectionIndex] = {
            ...mockInspections[inspectionIndex],
            ...updateData
          };
          resolve(mockInspections[inspectionIndex]);
        } else {
          throw new Error('Inspection not found');
        }
      }, 500);
    });
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiInspection = await response.json();
    return apiInspection.data || null;

  } catch (error) {
    console.warn('API call failed, falling back to mock update:', error.message);
    
    // Simulate update in mock data
    const inspectionIndex = mockInspections.findIndex(inspection => 
      inspection.id === parseInt(id)
    );
    
    if (inspectionIndex !== -1) {
      mockInspections[inspectionIndex] = {
        ...mockInspections[inspectionIndex],
        ...updateData
      };
      return mockInspections[inspectionIndex];
    } else {
      throw new Error('Inspection not found');
    }
  }
}

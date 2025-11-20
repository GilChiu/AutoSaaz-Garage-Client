import DEV_CONFIG from '../config/dev';
import { SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

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
 * Service for managing garage services
 */
const garageServicesService = {
  /**
   * Fetch all services for the authenticated garage
   * @returns {Promise<Array>} Array of service objects
   */
  async getGarageServices() {
    const endpoint = '/garage-services';
    
    // Check cache first (3 minutes TTL)
    const cached = cache.get(endpoint);
    if (cached) {
      return cached;
    }
    
    // Use retry logic for resilience
    const services = await retryApiCall(async () => {
      const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/garage-services`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch services' }));
        throw new Error(error.message || 'Failed to fetch services');
      }

      const result = await response.json();
      return result.data?.services || [];
    }, `GET ${endpoint}`);
    
    // Cache the result (3 minutes)
    cache.set(endpoint, {}, services, 180);
    
    return services;
  },

  /**
   * Create a new service
   * @param {Object} serviceData - Service data
   * @param {string} serviceData.name - Service name
   * @param {string} serviceData.category - Service category
   * @param {string} serviceData.price - Estimated price range
   * @param {string} serviceData.time - Estimated time
   * @returns {Promise<Object>} Created service object
   */
  async createService(serviceData) {
    const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/garage-services`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(serviceData)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create service' }));
      throw new Error(error.message || 'Failed to create service');
    }

    const result = await response.json();
    
    // Invalidate services cache after creation
    cache.invalidatePattern('garage-services');
    
    return result.data?.service;
  },

  /**
   * Update an existing service
   * @param {string} id - Service ID
   * @param {Object} serviceData - Updated service data
   * @returns {Promise<Object>} Updated service object
   */
  async updateService(id, serviceData) {
    const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/garage-services`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ id, ...serviceData })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update service' }));
      throw new Error(error.message || 'Failed to update service');
    }

    const result = await response.json();
    
    // Invalidate services cache after update
    cache.invalidatePattern('garage-services');
    
    return result.data?.service;
  },

  /**
   * Delete a service
   * @param {string} id - Service ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteService(id) {
    const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/garage-services?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete service' }));
      throw new Error(error.message || 'Failed to delete service');
    }
    
    // Invalidate services cache after deletion
    cache.invalidatePattern('garage-services');

    return true;
  }
};

export default garageServicesService;

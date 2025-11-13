import DEV_CONFIG from '../config/dev';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibGNqeWVpd2d5YW5hZHNzcWFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0NzU0MDEsImV4cCI6MjA0NjA1MTQwMX0.XF-wGXEwC7YWAn6xLfh2_Zey-Q-9Bz0jYRGCIDSlgzg';

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
    const response = await fetch(`${DEV_CONFIG.API_BASE_URL}/garage-services`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch services' }));
      throw new Error(error.message || 'Failed to fetch services');
    }

    const data = await response.json();
    return data.services || [];
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

    const data = await response.json();
    return data.service;
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

    const data = await response.json();
    return data.service;
  },

  /**
   * Delete a service
   * @param {string} id - Service ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteService(id) {
    const token = localStorage.getItem('accessToken');
    if (!token) {
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
};

export default garageServicesService;

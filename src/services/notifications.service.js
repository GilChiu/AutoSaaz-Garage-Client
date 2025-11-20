import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

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
 * Fetches push notifications for the garage
 * @param {Object} [params] - Query parameters
 * @param {number} [params.limit] - Number of notifications to fetch
 * @param {boolean} [params.unreadOnly] - Fetch only unread notifications
 * @returns {Promise<Array>}
 */
export async function getNotifications(params = {}) {
  try {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unreadOnly) queryParams.append('unread_only', 'true');
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/garage-notifications${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const notifications = result.data || result.notifications || [];
    
    return notifications;

  } catch (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }
}

/**
 * Marks a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>}
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/garage-notifications/${notificationId}/read`, {
      method: 'POST',
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
 * Marks all notifications as read
 * @returns {Promise<boolean>}
 */
export async function markAllNotificationsAsRead() {
  try {
    const response = await fetch(`${API_BASE_URL}/garage-notifications/read-all`, {
      method: 'POST',
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
 * Gets unread notification count
 * @returns {Promise<number>}
 */
export async function getUnreadCount() {
  try {
    const response = await fetch(`${API_BASE_URL}/garage-notifications/unread-count`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.data?.count || result.count || 0;

  } catch (error) {
    return 0; // Return 0 on error to avoid breaking the UI
  }
}

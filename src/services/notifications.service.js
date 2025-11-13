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
    console.log('=== FETCHING NOTIFICATIONS ===');
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unreadOnly) queryParams.append('unread_only', 'true');
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/garage-notifications${queryString ? `?${queryString}` : ''}`;

    console.log('Notifications URL:', url);

    const response = await fetch(url, {
      headers: getHeaders(),
    });

    console.log('Response Status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Notifications Response:', result);
    
    const notifications = result.data || result.notifications || [];
    
    console.log('=== NOTIFICATIONS FETCH SUCCESS ===');
    return notifications;

  } catch (error) {
    console.error('=== NOTIFICATIONS FETCH ERROR ===');
    console.error('Error:', error.message);
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
    console.log('=== MARKING NOTIFICATION AS READ ===', notificationId);
    
    const response = await fetch(`${API_BASE_URL}/garage-notifications/${notificationId}/read`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    console.log('=== NOTIFICATION MARKED AS READ ===');
    return true;

  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
}

/**
 * Marks all notifications as read
 * @returns {Promise<boolean>}
 */
export async function markAllNotificationsAsRead() {
  try {
    console.log('=== MARKING ALL NOTIFICATIONS AS READ ===');
    
    const response = await fetch(`${API_BASE_URL}/garage-notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    console.log('=== ALL NOTIFICATIONS MARKED AS READ ===');
    return true;

  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
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
    console.error('Failed to fetch unread count:', error);
    return 0; // Return 0 on error to avoid breaking the UI
  }
}

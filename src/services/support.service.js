// Support tickets service for garage client
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

// Helper to get auth headers
function getHeaders() {
  const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...(accessToken ? { 'x-access-token': accessToken } : {})
  };
}

// Create a new support ticket
export async function createSupportTicket(payload) {
  // Contract: { contactName, contactEmail, contactPhone, subject, message, source }
  try {
    const profileData = localStorage.getItem('profile');
    console.log('Raw profile data from localStorage:', profileData);
    
    const profile = profileData ? JSON.parse(profileData) : null;
    console.log('Parsed profile:', profile);

    // Use user_id from profile (which is the foreign key to users table)
    const senderId = profile?.user_id || profile?.userId || null;
    console.log('Sender ID (user_id):', senderId);

    if (!senderId) {
      console.error('Profile data missing or invalid:', { profileData, profile });
      throw new Error('User ID not found in profile. Please log in again.');
    }

    const requestPayload = {
      senderId: senderId,
      senderType: 'garage',
      contactName: payload.contactName,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone || null,
      subject: payload.subject,
      message: payload.message,
      source: payload.source || 'garage-portal',
      priority: payload.priority || 'normal'
    };

    console.log('Creating ticket with payload:', requestPayload);

    const res = await fetch(`${API_BASE_URL}/support-tickets`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(requestPayload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || res.statusText || 'Failed');
    }

    const json = await res.json();
    
    // Invalidate support tickets cache after creation
    cache.invalidatePattern('support-tickets');
    
    return json.data || json;
  } catch (e) {
    console.error('Create ticket error:', e);
    throw new Error(e?.message || 'Network error');
  }
}

// Get list of support tickets for the garage
export async function getGarageTickets(status = null) {
  try {
    const profileData = localStorage.getItem('profile');
    const profile = profileData ? JSON.parse(profileData) : null;

    // Use user_id from profile
    const senderId = profile?.user_id || profile?.userId || null;

    let endpoint = `/support-tickets?senderType=garage`;
    if (senderId) {
      endpoint += `&senderId=${senderId}`;
    }
    if (status) {
      endpoint += `&status=${status}`;
    }
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) {
      console.log('[Support] Tickets FROM CACHE');
      return cached;
    }

    // Use retry logic for resilience
    const result = await retryApiCall(async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(res.statusText || 'Failed');
      }

      return await res.json();
    }, `GET ${endpoint}`);

    const tickets = result.tickets || [];
    
    // Cache the result
    cache.set(endpoint, {}, tickets);
    
    return tickets;
  } catch (e) {
    throw new Error(e?.message || 'Network error');
  }
}

// Get ticket detail with conversation
export async function getTicketDetail(ticketId) {
  try {
    const endpoint = `/support-tickets/${ticketId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) {
      console.log('[Support] Ticket detail FROM CACHE, id:', ticketId);
      return cached;
    }
    
    // Use retry logic for resilience
    const result = await retryApiCall(async () => {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getHeaders()
      });

      if (!res.ok) {
        throw new Error(res.statusText || 'Failed');
      }

      return await res.json();
    }, `GET ${endpoint}`);
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  } catch (e) {
    throw new Error(e?.message || 'Network error');
  }
}

// Add message to ticket
export async function addTicketMessage(ticketId, message) {
  try {
    const profileData = localStorage.getItem('profile');
    console.log('Raw profile data from localStorage:', profileData);
    
    const profile = profileData ? JSON.parse(profileData) : null;
    console.log('Parsed profile:', profile);
    
    // Use user_id from profile (which is the foreign key to users table)
    const senderId = profile?.user_id || profile?.userId || null;
    console.log('Sender ID (user_id):', senderId);

    if (!senderId) {
      console.error('Profile data missing or invalid:', { profileData, profile });
      throw new Error('User ID not found in profile. Please log in again.');
    }

    const payload = {
      action: 'add_message',
      senderId: senderId,
      senderType: 'garage',
      message: message
    };

    console.log('Sending message with payload:', payload);

    const res = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errorData.error || res.statusText || 'Failed');
    }

    const json = await res.json();
    
    // Invalidate ticket detail cache after adding message
    cache.invalidate(`/support-tickets/${ticketId}`);
    
    return json.message || json;
  } catch (e) {
    console.error('Add message error:', e);
    throw new Error(e?.message || 'Network error');
  }
}

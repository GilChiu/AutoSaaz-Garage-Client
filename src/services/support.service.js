// Support tickets service for garage client
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

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
    const profile = profileData ? JSON.parse(profileData) : null;

    if (!profile?.id) {
      throw new Error('Profile ID not found. Please log in again.');
    }

    const requestPayload = {
      senderId: profile.id,
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

    let url = `${API_BASE_URL}/support-tickets?senderType=garage`;
    if (profile?.id) {
      url += `&senderId=${profile.id}`;
    }
    if (status) {
      url += `&status=${status}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error(res.statusText || 'Failed');
    }

    const json = await res.json();
    return json.tickets || [];
  } catch (e) {
    throw new Error(e?.message || 'Network error');
  }
}

// Get ticket detail with conversation
export async function getTicketDetail(ticketId) {
  try {
    const res = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!res.ok) {
      throw new Error(res.statusText || 'Failed');
    }

    return await res.json();
  } catch (e) {
    throw new Error(e?.message || 'Network error');
  }
}

// Add message to ticket
export async function addTicketMessage(ticketId, message) {
  try {
    const profileData = localStorage.getItem('profile');
    const profile = profileData ? JSON.parse(profileData) : null;

    if (!profile?.id) {
      throw new Error('Profile ID not found. Please log in again.');
    }

    const payload = {
      action: 'add_message',
      senderId: profile.id,
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
    return json.message || json;
  } catch (e) {
    console.error('Add message error:', e);
    throw new Error(e?.message || 'Network error');
  }
}

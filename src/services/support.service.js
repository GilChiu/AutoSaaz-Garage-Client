// Front-end only service with mock + API-ready shape
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function createSupportTicket(payload) {
  // Contract: { contactName, contactEmail, subject, message, source }
  if (USE_MOCKS) {
    return new Promise((resolve) => setTimeout(() => resolve({ id: Date.now(), ...payload, status: 'open' }), 400));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/support/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(res.statusText || 'Failed');
    const json = await res.json();
    return json.data || { success: true };
  } catch (e) {
    // Surface concise error for UI
    throw new Error(e?.message || 'Network error');
  }
}

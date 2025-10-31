// Front-end service wired to Supabase Functions
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true';
const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

export async function createSupportTicket(payload) {
  // Contract: { contactName, contactEmail, subject, message, source }
  if (USE_MOCKS) {
    return new Promise((resolve) => setTimeout(() => resolve({ id: Date.now(), ...payload, status: 'open' }), 400));
  }
  try {
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/support-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Supabase gateway requires anon key
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        // Protected endpoints require app token
        ...(accessToken ? { 'x-autosaaz-token': accessToken } : {})
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

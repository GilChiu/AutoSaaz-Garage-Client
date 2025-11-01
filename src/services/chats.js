// Chats service for Garage client to call Supabase Edge Functions
// Uses anon key + x-access-token (from localStorage) like other function calls

import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

function headers() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    ...(token ? { 'x-access-token': token } : {}),
  };
}

function url(path) {
  if (!path.startsWith('/')) path = `/${path}`;
  return `${FUNCTIONS_URL}${path}`;
}

export async function listConversations({ limit = 20, offset = 0 } = {}) {
  const qs = new URLSearchParams({ limit: String(limit), offset: String(offset) }).toString();
  const res = await axios.get(url(`/chats/conversations?${qs}`), { headers: headers() });
  return res.data;
}

export async function createConversation(otherUserId) {
  const res = await axios.post(url('/chats/conversations'), { otherUserId }, { headers: headers() });
  return res.data;
}

export async function getConversation(id) {
  const res = await axios.get(url(`/chats/conversations/${id}`), { headers: headers() });
  return res.data;
}

export async function getMessages(conversationId, { limit = 50, before, after } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  if (after) params.set('after', after);
  const res = await axios.get(url(`/chats/conversations/${conversationId}/messages?${params.toString()}`), { headers: headers() });
  return res.data;
}

export async function sendMessage(conversationId, { content, attachment_url, message_type } = {}) {
  const payload = {};
  if (content) payload.content = content;
  if (attachment_url) payload.attachment_url = attachment_url;
  if (message_type) payload.message_type = message_type;
  const res = await axios.post(url(`/chats/conversations/${conversationId}/messages`), payload, { headers: headers() });
  return res.data;
}

export async function markRead(conversationId, upTo) {
  const res = await axios.post(url(`/chats/conversations/${conversationId}/read`), upTo ? { upTo } : {}, { headers: headers() });
  return res.data;
}

const chats = {
  listConversations,
  createConversation,
  getConversation,
  getMessages,
  sendMessage,
  markRead,
};

export default chats;

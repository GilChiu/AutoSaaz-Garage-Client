// Chats service for Garage client to call Supabase Edge Functions
// Uses anon key + x-access-token (from localStorage) like other function calls

import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

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
  const endpoint = `/chats/conversations?${qs}`;
  
  // Check cache first (chats cached for 30 seconds as they change frequently)
  const cached = cache.get(endpoint);
  if (cached) {
    return cached;
  }
  
  const requestUrl = url(endpoint);
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(requestUrl, { headers: headers() });
  }, `GET ${endpoint}`).catch((e) => {
    throw e;
  });
  
  const payload = res?.data?.data ?? res?.data;
  
  // Cache the result (30 seconds TTL for chats)
  cache.set(endpoint, {}, payload, 30);
  
  return payload;
}

export async function createConversation(otherUserId) {
  const requestUrl = url('/chats/conversations');
  const res = await axios.post(requestUrl, { otherUserId }, { headers: headers() }).catch((e) => {
    throw e;
  });
  
  // Invalidate conversations cache after creation
  cache.invalidatePattern('chats/conversations');
  
  return res?.data?.data ?? res?.data;
}

export async function getConversation(id) {
  const endpoint = `/chats/conversations/${id}`;
  
  // Check cache first
  const cached = cache.get(endpoint);
  if (cached) {
    return cached;
  }
  
  const requestUrl = url(endpoint);
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(requestUrl, { headers: headers() });
  }, `GET ${endpoint}`).catch((e) => {
    throw e;
  });
  
  const result = res?.data?.data ?? res?.data;
  
  // Cache the result (30 seconds TTL)
  cache.set(endpoint, {}, result, 30);
  
  return result;
}

export async function getMessages(conversationId, { limit = 50, before, after } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  if (after) params.set('after', after);
  const endpoint = `/chats/conversations/${conversationId}/messages?${params.toString()}`;
  
  // Check cache first (messages cached for 30 seconds)
  const cached = cache.get(endpoint);
  if (cached) {
    return cached;
  }
  
  const requestUrl = url(endpoint);
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(requestUrl, { headers: headers() });
  }, `GET ${endpoint}`).catch((e) => {
    throw e;
  });
  
  const payload = res?.data?.data ?? res?.data;
  
  // Cache the result (30 seconds TTL)
  cache.set(endpoint, {}, payload, 30);
  
  return payload;
}

export async function sendMessage(conversationId, { content, attachment_url, message_type } = {}) {
  const payload = {};
  if (content) payload.content = content;
  if (attachment_url) payload.attachment_url = attachment_url;
  if (message_type) payload.message_type = message_type;
  const requestUrl = url(`/chats/conversations/${conversationId}/messages`);
  const res = await axios.post(requestUrl, payload, { headers: headers() }).catch((e) => {
    throw e;
  });
  
  // Invalidate messages and conversations cache after sending
  cache.invalidatePattern(`chats/conversations/${conversationId}/messages`);
  cache.invalidatePattern('chats/conversations');
  
  return res?.data?.data ?? res?.data;
}

export async function markRead(conversationId, upTo) {
  const requestUrl = url(`/chats/conversations/${conversationId}/read`);
  const res = await axios.post(requestUrl, upTo ? { upTo } : {}, { headers: headers() }).catch((e) => {
    throw e;
  });
  
  // Invalidate conversations cache after marking as read (updates unread count)
  cache.invalidatePattern('chats/conversations');
  cache.invalidate(`/chats/conversations/${conversationId}`);
  
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

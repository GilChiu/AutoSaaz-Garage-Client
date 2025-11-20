// Chats service for Garage client to call Supabase Edge Functions
// Uses anon key + x-access-token (from localStorage) like other function calls

import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

function headers() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('accessToken') : null;
  try {
    console.debug('[chats.service] headers prepared', {
      anonKeyPresent: !!SUPABASE_ANON_KEY,
      hasAccessToken: !!token,
    });
  } catch {}
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
    console.debug('[chats.service] /conversations FROM CACHE');
    return cached;
  }
  
  const requestUrl = url(endpoint);
  console.debug('[chats.service] GET', requestUrl);
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(requestUrl, { headers: headers() });
  }, `GET ${endpoint}`).catch((e) => {
    console.error('[chats.service] GET /conversations error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  
  const payload = res?.data?.data ?? res?.data;
  console.debug('[chats.service] /conversations payload shape', {
    enveloped: !!res?.data?.data,
    keys: Object.keys(payload || {}),
  });
  
  // Cache the result (30 seconds TTL for chats)
  cache.set(endpoint, {}, payload, 30);
  
  return payload;
}

export async function createConversation(otherUserId) {
  const requestUrl = url('/chats/conversations');
  console.debug('[chats.service] POST', requestUrl, { otherUserId });
  const res = await axios.post(requestUrl, { otherUserId }, { headers: headers() }).catch((e) => {
    console.error('[chats.service] POST /conversations error', e?.response?.status, e?.response?.data || e?.message);
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
    console.debug('[chats.service] /conversations/:id FROM CACHE');
    return cached;
  }
  
  const requestUrl = url(endpoint);
  console.debug('[chats.service] GET', requestUrl);
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(requestUrl, { headers: headers() });
  }, `GET ${endpoint}`).catch((e) => {
    console.error('[chats.service] GET /conversations/:id error', e?.response?.status, e?.response?.data || e?.message);
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
    console.debug('[chats.service] /messages FROM CACHE');
    return cached;
  }
  
  const requestUrl = url(endpoint);
  console.debug('[chats.service] GET', requestUrl);
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(requestUrl, { headers: headers() });
  }, `GET ${endpoint}`).catch((e) => {
    console.error('[chats.service] GET /messages error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  
  const payload = res?.data?.data ?? res?.data;
  console.debug('[chats.service] /messages count', payload?.messages?.length ?? 0);
  
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
  console.debug('[chats.service] POST', requestUrl, { hasContent: !!payload.content, hasAttachment: !!payload.attachment_url, message_type: payload.message_type });
  const res = await axios.post(requestUrl, payload, { headers: headers() }).catch((e) => {
    console.error('[chats.service] POST /messages error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  
  // Invalidate messages and conversations cache after sending
  cache.invalidatePattern(`chats/conversations/${conversationId}/messages`);
  cache.invalidatePattern('chats/conversations');
  
  return res?.data?.data ?? res?.data;
}

export async function markRead(conversationId, upTo) {
  const requestUrl = url(`/chats/conversations/${conversationId}/read`);
  console.debug('[chats.service] POST', requestUrl, { upToPresent: !!upTo });
  const res = await axios.post(requestUrl, upTo ? { upTo } : {}, { headers: headers() }).catch((e) => {
    console.error('[chats.service] POST /read error', e?.response?.status, e?.response?.data || e?.message);
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

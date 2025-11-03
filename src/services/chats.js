// Chats service for Garage client to call Supabase Edge Functions
// Uses anon key + x-access-token (from localStorage) like other function calls

import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

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
  const requestUrl = url(`/chats/conversations?${qs}`);
  console.debug('[chats.service] GET', requestUrl);
  const res = await axios.get(requestUrl, { headers: headers() }).catch((e) => {
    console.error('[chats.service] GET /conversations error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  const payload = res?.data?.data ?? res?.data;
  console.debug('[chats.service] /conversations payload shape', {
    enveloped: !!res?.data?.data,
    keys: Object.keys(payload || {}),
  });
  return payload;
}

export async function createConversation(otherUserId) {
  const requestUrl = url('/chats/conversations');
  console.debug('[chats.service] POST', requestUrl, { otherUserId });
  const res = await axios.post(requestUrl, { otherUserId }, { headers: headers() }).catch((e) => {
    console.error('[chats.service] POST /conversations error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  return res?.data?.data ?? res?.data;
}

export async function getConversation(id) {
  const requestUrl = url(`/chats/conversations/${id}`);
  console.debug('[chats.service] GET', requestUrl);
  const res = await axios.get(requestUrl, { headers: headers() }).catch((e) => {
    console.error('[chats.service] GET /conversations/:id error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  return res?.data?.data ?? res?.data;
}

export async function getMessages(conversationId, { limit = 50, before, after } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);
  if (after) params.set('after', after);
  const requestUrl = url(`/chats/conversations/${conversationId}/messages?${params.toString()}`);
  console.debug('[chats.service] GET', requestUrl);
  const res = await axios.get(requestUrl, { headers: headers() }).catch((e) => {
    console.error('[chats.service] GET /messages error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
  const payload = res?.data?.data ?? res?.data;
  console.debug('[chats.service] /messages count', payload?.messages?.length ?? 0);
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
  return res?.data?.data ?? res?.data;
}

export async function markRead(conversationId, upTo) {
  const requestUrl = url(`/chats/conversations/${conversationId}/read`);
  console.debug('[chats.service] POST', requestUrl, { upToPresent: !!upTo });
  const res = await axios.post(requestUrl, upTo ? { upTo } : {}, { headers: headers() }).catch((e) => {
    console.error('[chats.service] POST /read error', e?.response?.status, e?.response?.data || e?.message);
    throw e;
  });
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

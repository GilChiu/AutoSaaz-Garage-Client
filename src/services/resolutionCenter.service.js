// Resolution Center service wired to Supabase Edge Functions (no mocks)
import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

function headers() {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
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

export function mapDispute(raw) {
  // Map server payload to UI card structure
  return {
    id: raw.id,
    code: raw.code || raw.disputeId || raw.id,
    orderId: raw.orderId || '—',
    customer: raw.customerName || raw.customerEmail || '—',
    phone: raw.customerPhone || '—',
    reason: raw.subject || '—',
    raisedAt: raw.raisedAt,
    status: raw.status,
    mechanic: raw.mechanicName || '—',
    resolution: raw.resolution || null,
    resolvedBy: raw.resolvedBy || null,
    resolvedAt: raw.resolvedAt || null,
    messageCount: raw.messageCount ?? 0,
  };
}

export function mapDisputeDetail(raw) {
  if (!raw) return null;
  return {
    id: raw.id,
    code: raw.code || raw.disputeId || raw.id,
    orderId: raw.orderId || '—',
    customer: raw.customerName || raw.customerEmail || '—',
    phone: raw.customerPhone || '—',
    reason: raw.subject || '—',
    raisedAt: raw.raisedAt,
    status: raw.status,
    resolution: raw.resolution || null,
    resolvedBy: raw.resolvedBy || null,
    resolvedAt: raw.resolvedAt || null,
    messages: (raw.messages || []).map(m => ({
      id: m.id,
      from: m.from || m.senderType?.toLowerCase() || 'user', // Backend now returns correct 'from' field
      text: m.text || m.body, // Support both field names
      ts: m.ts || m.createdAt,
      attachmentUrl: m.attachmentUrl || m.attachment_url,
      attachmentType: m.attachmentType || m.attachment_type,
      attachmentName: m.attachmentName || m.attachment_name,
      isEvidenceRequest: m.isEvidenceRequest || m.is_evidence_request || false,
      isEscalationNotice: m.isEscalationNotice || m.is_escalation_notice || false,
      isResolutionNotice: m.isResolutionNotice || m.is_resolution_notice || false
    })),
  };
}

export async function createDispute({ subject, message, contactName, contactEmail, bookingId }) {
  const payload = { subject, message, contactName, contactEmail };
  if (bookingId) payload.bookingId = bookingId;
  const res = await axios.post(url(`/resolution-center`), payload, { headers: headers() });
  
  // Invalidate disputes cache after creation
  cache.invalidatePattern('resolution-center');
  
  return res?.data?.data ?? res?.data;
}

export async function getDisputes(status, signal) {
  const endpoint = `/resolution-center?status=${encodeURIComponent(status || '')}`;
  
  // Check cache first (skip if aborted)
  if (!signal?.aborted) {
    const cached = cache.get(endpoint);
    if (cached) {
      return cached;
    }
  }
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(url(endpoint), {
      headers: headers(),
      signal,
    });
  }, `GET ${endpoint}`);
  
  // Check if response has the new paginated format
  const responseData = res?.data?.data ?? res?.data;
  
  // New paginated format: { disputes: [...], total, page, limit }
  let result;
  if (responseData?.disputes && Array.isArray(responseData.disputes)) {
    result = responseData.disputes;
  } else {
    // Fallback for array response
    result = Array.isArray(responseData) ? responseData : [];
  }
  
  // Cache the result
  cache.set(endpoint, {}, result);
  
  return result;
}

export async function getDisputeById(id, signal, skipCache = false) {
  const endpoint = `/resolution-center/${id}`;
  
  // Check cache first (skip if aborted or skipCache flag set)
  if (!signal?.aborted && !skipCache) {
    const cached = cache.get(endpoint);
    if (cached) {
      console.log('[Cache] localStorage hit for dispute:', id);
      return cached;
    }
  } else if (skipCache) {
    console.log('[Polling] Bypassing cache for fresh data');
  }
  
  // Use retry logic for resilience
  const res = await retryApiCall(async () => {
    return await axios.get(url(endpoint), { headers: headers(), signal });
  }, `GET ${endpoint}`);
  
  const result = res?.data?.data ?? res?.data;
  
  // Cache the result
  cache.set(endpoint, {}, result);
  
  return result;
}

export async function postDisputeMessage(id, text, attachmentUrl = null, attachmentType = null, attachmentName = null) {
  const payload = { text };
  if (attachmentUrl) {
    payload.attachmentUrl = attachmentUrl;
    payload.attachmentType = attachmentType;
    payload.attachmentName = attachmentName;
  }
  const res = await axios.post(url(`/resolution-center/${id}/messages`), payload, { headers: headers() });
  
  // Invalidate dispute detail cache after adding message
  cache.invalidate(`/resolution-center/${id}`);
  
  return res?.data?.data ?? res?.data;
}

export async function resolveDispute(id, resolutionText) {
  const res = await axios.put(url(`/resolution-center/${id}/resolve`), { resolution: resolutionText }, { headers: headers() });
  
  // Invalidate disputes cache after resolution
  cache.invalidatePattern('resolution-center');
  cache.invalidate(`/resolution-center/${id}`);
  
  return res?.data?.data ?? res?.data;
}

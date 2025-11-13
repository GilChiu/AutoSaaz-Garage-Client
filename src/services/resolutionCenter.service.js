// Resolution Center service wired to Supabase Edge Functions (no mocks)
import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

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
      from: m.senderType?.toLowerCase() || m.from || 'user', // Map senderType to from (admin/user)
      text: m.body || m.text, // Backend sends 'body', UI expects 'text'
      ts: m.createdAt || m.ts,
      attachmentUrl: m.attachmentUrl || m.attachment_url,
      attachmentType: m.attachmentType || m.attachment_type,
      attachmentName: m.attachmentName || m.attachment_name,
      isEvidenceRequest: m.isEvidenceRequest || m.is_evidence_request || false
    })),
  };
}

export async function createDispute({ subject, message, contactName, contactEmail, bookingId }) {
  const payload = { subject, message, contactName, contactEmail };
  if (bookingId) payload.bookingId = bookingId;
  const res = await axios.post(url(`/resolution-center`), payload, { headers: headers() });
  return res?.data?.data ?? res?.data;
}

export async function getDisputes(status, signal) {
  const res = await axios.get(url(`/resolution-center?status=${encodeURIComponent(status || '')}`), {
    headers: headers(),
    signal,
  });
  const payload = res?.data?.data ?? res?.data;
  // Backend returns { disputes: [...], total, page, limit }
  if (payload?.disputes && Array.isArray(payload.disputes)) {
    return payload.disputes;
  }
  return Array.isArray(payload) ? payload : [];
}

export async function getDisputeById(id, signal) {
  const res = await axios.get(url(`/resolution-center/${id}`), { headers: headers(), signal });
  return res?.data?.data ?? res?.data;
}

export async function postDisputeMessage(id, text, attachmentUrl = null, attachmentType = null, attachmentName = null) {
  const payload = { text };
  if (attachmentUrl) {
    payload.attachmentUrl = attachmentUrl;
    payload.attachmentType = attachmentType;
    payload.attachmentName = attachmentName;
  }
  const res = await axios.post(url(`/resolution-center/${id}/messages`), payload, { headers: headers() });
  return res?.data?.data ?? res?.data;
}

export async function resolveDispute(id, resolutionText) {
  const res = await axios.put(url(`/resolution-center/${id}/resolve`), { resolution: resolutionText }, { headers: headers() });
  return res?.data?.data ?? res?.data;
}

// Resolution Center mock service (rcfx)
import DEV_CONFIG from '../config/dev.js';

const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true' || !DEV_CONFIG.ENABLE_AUTH;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Mock disputes
let mockDisputes = [
  {
    id: 101,
    orderId: 'ORD-2051',
    disputeCode: 'DISP-1045',
    customerName: 'Ali Raza',
    customerPhone: '0301-1234567',
    reason: 'Extra charges added',
    raisedAt: '2025-06-12T14:35:00Z',
    status: 'new', // new | resolved
    mechanicName: 'Ahmad Fraz',
    resolution: null,
    resolvedBy: null,
    resolvedAt: null,
    messages: [
      { id: 1, from: 'customer', text: "Hello admin the customer hasn't pay after delivery.", ts: '2025-06-12T10:22:00Z' },
      { id: 2, from: 'admin', text: 'Thank you for reporting we are reviewing the order.', ts: '2025-06-12T10:26:00Z' }
    ]
  },
  {
    id: 102,
    orderId: 'ORD-2090',
    disputeCode: 'DISP-1099',
    customerName: 'Sara Khan',
    customerPhone: '0302-5551111',
    reason: 'Incorrect part installed',
    raisedAt: '2025-06-11T09:12:00Z',
    status: 'resolved',
    mechanicName: 'Bilal Ahmed',
    resolution: 'Refund issue to customer',
    resolvedBy: 'Admin',
    resolvedAt: '2025-06-12T08:10:00Z',
    messages: [
      { id: 1, from: 'customer', text: 'The installed part was wrong model.', ts: '2025-06-11T09:15:00Z' },
      { id: 2, from: 'admin', text: 'We will investigate this for you.', ts: '2025-06-11T09:17:00Z' },
      { id: 3, from: 'admin', text: 'Issue resolved, refund will be processed.', ts: '2025-06-12T08:10:00Z' }
    ]
  }
];

export function mapDispute(raw) {
  return {
    id: raw.id,
    code: raw.disputeCode,
    orderId: raw.orderId,
    customer: raw.customerName,
    phone: raw.customerPhone,
    reason: raw.reason,
    raisedAt: raw.raisedAt,
    status: raw.status,
    mechanic: raw.mechanicName,
    resolution: raw.resolution,
    resolvedBy: raw.resolvedBy,
    resolvedAt: raw.resolvedAt,
    messageCount: raw.messages.length
  };
}

export function mapDisputeDetail(raw) {
  if (!raw) return null;
  return { ...mapDispute(raw), messages: raw.messages.slice() };
}

export async function getDisputes(status, signal) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => {
      resolve(mockDisputes.filter(d => (status ? d.status === status : true)));
    }, 300));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/resolution-center?status=${status||''}`, { headers: { 'Authorization': token?`Bearer ${token}`:'' }, signal });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.warn('Resolution disputes API failed, fallback to mocks:', e.message);
    return mockDisputes.filter(d => (status ? d.status === status : true));
  }
}

export async function getDisputeById(id, signal) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => {
      resolve(mockDisputes.find(d => d.id === parseInt(id)) || null);
    }, 250));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/resolution-center/${id}`, { headers: { 'Authorization': token?`Bearer ${token}`:'' }, signal });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.warn('Dispute detail API failed, fallback to mocks:', e.message);
    return mockDisputes.find(d => d.id === parseInt(id)) || null;
  }
}

export async function postDisputeMessage(id, text) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => {
      const target = mockDisputes.find(d => d.id === parseInt(id));
      if (target) {
        const newMsg = { id: target.messages.length + 1, from: 'admin', text, ts: new Date().toISOString() };
        target.messages.push(newMsg);
        resolve(newMsg);
      } else {
        resolve(null);
      }
    }, 200));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/resolution-center/${id}/messages`, {
      method: 'POST',
      headers: { 'Authorization': token?`Bearer ${token}`:'', 'Content-Type':'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.warn('Post message failed, mock append:', e.message);
    return postDisputeMessage(id, text); // fallback to mock logic
  }
}

export async function resolveDispute(id, resolutionText) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => {
      const idx = mockDisputes.findIndex(d => d.id === parseInt(id));
      if (idx !== -1) {
        mockDisputes[idx] = { ...mockDisputes[idx], status: 'resolved', resolution: resolutionText, resolvedBy: 'Admin', resolvedAt: new Date().toISOString() };
        resolve(mockDisputes[idx]);
      } else resolve(null);
    }, 300));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/resolution-center/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Authorization': token?`Bearer ${token}`:'', 'Content-Type':'application/json' },
      body: JSON.stringify({ resolution: resolutionText })
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.warn('Resolve dispute failed, mock fallback:', e.message);
    return resolveDispute(id, resolutionText);
  }
}

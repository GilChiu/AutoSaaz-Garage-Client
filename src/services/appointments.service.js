import DEV_CONFIG from '../config/dev.js';

// Temporary mock data (replace with real API later)
const mockAppointments = [
  {
    id: 1,
    customerName: 'Michael Johnson',
    vehicle: { make: 'BMW', model: 'X5', year: 2022 },
    serviceType: 'Brake pad replacement',
    appointmentDate: '2025-06-06T23:00:00Z',
    status: 'confirmed',
    priority: 'normal'
  },
  {
    id: 2,
    customerName: 'Sarah Lee',
    vehicle: { make: 'Honda', model: 'Civic', year: 2021 },
    serviceType: 'Oil change',
    appointmentDate: '2025-06-07T23:00:00Z',
    status: 'pending',
    priority: 'high'
  }
];

const USE_MOCKS = process.env.REACT_APP_USE_MOCKS === 'true' || !DEV_CONFIG.ENABLE_AUTH;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export async function getAppointments(signal) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => resolve(mockAppointments), 400));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      signal
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.warn('Appointments API failed, fallback to mocks:', e.message);
    return mockAppointments;
  }
}

export async function getAppointmentById(id, signal) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => {
      resolve(mockAppointments.find(a => a.id === parseInt(id)) || null);
    }, 250));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
      signal
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.warn('Appointment detail API failed, fallback to mocks:', e.message);
    return mockAppointments.find(a => a.id === parseInt(id)) || null;
  }
}

export async function updateAppointment(id, updateData) {
  if (USE_MOCKS) {
    return new Promise(resolve => setTimeout(() => {
      const idx = mockAppointments.findIndex(a => a.id === parseInt(id));
      if (idx !== -1) {
        mockAppointments[idx] = { ...mockAppointments[idx], ...updateData };
        resolve(mockAppointments[idx]);
      } else {
        resolve(null);
      }
    }, 300));
  }
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    return json.data || null;
  } catch (e) {
    console.warn('Appointment update API failed, fallback to mock update:', e.message);
    const idx = mockAppointments.findIndex(a => a.id === parseInt(id));
    if (idx !== -1) {
      mockAppointments[idx] = { ...mockAppointments[idx], ...updateData };
      return mockAppointments[idx];
    }
    return null;
  }
}

// Mapping helpers to keep UI decoupled
export function mapAppointment(raw) {
  return {
    id: raw.id,
    customer: raw.customerName,
    vehicleLabel: `${raw.vehicle.make} ${raw.vehicle.model} (${raw.vehicle.year})`,
    service: raw.serviceType,
    date: raw.appointmentDate,
    status: raw.status, // pending | confirmed | cancelled
    priority: raw.priority // high | normal
  };
}

export function mapDetailedAppointment(raw) {
  if (!raw) return null;
  return {
    ...mapAppointment(raw),
    vehicle: raw.vehicle,
    raw // keep original reference for future extension
  };
}

export async function acceptAppointment(id) {
  return updateAppointment(id, { status: 'confirmed' });
}

export async function cancelAppointment(id) {
  return updateAppointment(id, { status: 'cancelled' });
}

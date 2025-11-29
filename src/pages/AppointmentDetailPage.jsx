import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { getAppointmentById, mapDetailedAppointment, acceptAppointment, cancelAppointment } from '../services/appointments.service';
import { formatDateTimeGST, formatDateGST, formatTimeGST } from '../utils/gstDateTime';
import '../styles/appointment-detail.css';

const DetailSkeleton = () => (
  <div className="apptfx-detail-card apptfx-detail-skel">
    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="apptfx-detail-skel-row" />)}
  </div>
);

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await getAppointmentById(id, controller.signal);
        setItem(mapDetailedAppointment(data));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load appointment');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const mutateStatus = async (actionFn, nextStatus) => {
    try {
      setActionLoading(true);
      console.log('🔄 [mutateStatus] Starting action for status:', nextStatus);
      const updated = await actionFn(id);
      console.log('✅ [mutateStatus] Action completed:', updated);
      
      // Refetch the appointment to get fresh data from server
      if (updated) {
        console.log('🔄 [mutateStatus] Refetching appointment data...');
        const freshData = await getAppointmentById(id);
        setItem(mapDetailedAppointment(freshData));
        console.log('✅ [mutateStatus] UI updated with fresh data');
      }
    } catch (e) {
      console.error('❌ [mutateStatus] Error:', e);
      setError('Action failed: ' + (e.message || 'Unknown error'));
    } finally {
      setActionLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return <DetailSkeleton />;
    if (!item) return <div className="apptfx-detail-error">Appointment not found.</div>;
    return (
      <>
        <div className="apptfx-detail-header">
          <h1 className="apptfx-detail-title">Appointments</h1>
          <p className="apptfx-detail-sub">Garage Overview and Activities</p>
        </div>
        <div className="apptfx-detail-section-heading">Appointment Summary</div>
        {error && <div className="apptfx-detail-error" role="alert">{error}</div>}
        <div className="apptfx-detail-card" data-status={item.status}>
          {item.priority === 'high' && <span className="apptfx-detail-pill apptfx-detail-pill-priority">High Urgency</span>}
          <div className="apptfx-detail-grid">
            <div className="apptfx-detail-row">
              <span className="apptfx-detail-icon" aria-hidden="true">👤</span>
              <span className="apptfx-detail-value">{item.customer}</span>
            </div>
            <div className="apptfx-detail-row">
              <span className="apptfx-detail-icon" aria-hidden="true">🚗</span>
              <span className="apptfx-detail-value">{item.vehicleLabel}</span>
            </div>
            <div className="apptfx-detail-row">
              <span className="apptfx-detail-icon" aria-hidden="true">🔧</span>
              <span className="apptfx-detail-label">Service Needed:</span>
              <span className="apptfx-detail-value">{item.service}</span>
            </div>
            <div className="apptfx-detail-row">
              <span className="apptfx-detail-icon" aria-hidden="true">📅</span>
              <span className="apptfx-detail-label">Date:</span>
              <span className="apptfx-detail-value">{formatDateGST(item.date)}</span>
            </div>
            <div className="apptfx-detail-row">
              <span className="apptfx-detail-icon" aria-hidden="true">🕒</span>
              <span className="apptfx-detail-label">Time:</span>
              <span className="apptfx-detail-value">{formatTimeGST(item.date)}</span>
            </div>
          </div>
          {item.status === 'pending' && (
            <div className="apptfx-detail-actions">
              <button
                className="apptfx-detail-btn apptfx-detail-btn-primary"
                disabled={actionLoading}
                onClick={() => mutateStatus(acceptAppointment, 'confirmed')}
              >
                {actionLoading ? 'Processing...' : 'Accept Appointment'}
              </button>
              <button
                className="apptfx-detail-btn apptfx-detail-btn-secondary"
                disabled={actionLoading}
                onClick={() => mutateStatus(cancelAppointment, 'cancelled')}
              >
                Cancel Appointment
              </button>
            </div>
          )}
          {item.status === 'confirmed' && <div className="apptfx-detail-status apptfx-detail-status-confirmed">✓ Appointment Confirmed</div>}
          {item.status === 'cancelled' && <div className="apptfx-detail-status apptfx-detail-status-cancelled">✗ Appointment Cancelled</div>}
        </div>
      </>
    );
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content apptfx-detail-page">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { getAppointments, mapAppointment } from '../services/appointments.service';
import '../components/Dashboard/Dashboard.css';
import '../styles/appointments.css';

// Utility formatters (kept isolated for easy replacement / i18n)
const formatLongDate = iso => new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const formatTime = iso => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

// Skeleton placeholder component
const AppointmentSkeleton = () => (
  <div className="apptfx-card apptfx-card-skeleton">
    <div className="apptfx-skel-row apptfx-skel-date" />
    <div className="apptfx-skel-row apptfx-skel-title" />
    <div className="apptfx-skel-row apptfx-skel-meta" />
  </div>
);

// Individual card
const AppointmentCard = ({ appt }) => {
  return (
    <div className="apptfx-card" data-status={appt.status} data-priority={appt.priority}>
      <div className="apptfx-card-top">
        <div className="apptfx-date-time">
          <div className="apptfx-date-block">
            <span className="apptfx-icon" aria-hidden="true">📅</span>
            <span>{formatLongDate(appt.date)}</span>
          </div>
          <div className="apptfx-time-block">
            <span className="apptfx-icon" aria-hidden="true">🕒</span>
            <span>{formatTime(appt.date)}</span>
          </div>
        </div>
        <div className="apptfx-status-block">
          <span className={`apptfx-status apptfx-status-${appt.status}`}>{appt.status === 'confirmed' ? 'Confirmed' : appt.status === 'pending' ? 'Pending' : appt.status}</span>
          {appt.priority === 'high' && <span className="apptfx-pill apptfx-pill-priority">Drop off</span>}
        </div>
      </div>
      <div className="apptfx-card-body">
        <div className="apptfx-customer">
          <h3 className="apptfx-customer-name">{appt.customer}</h3>
          <div className="apptfx-vehicle"><span className="apptfx-icon" aria-hidden="true">🚗</span>{appt.vehicleLabel}</div>
          <div className="apptfx-service"><span className="apptfx-icon" aria-hidden="true">🔧</span>{appt.service}</div>
        </div>
        <div className="apptfx-actions">
            <Link to={`/appointments/${appt.id}`} className="apptfx-btn apptfx-btn-primary">View Details</Link>
        </div>
      </div>
    </div>
  );
};

const AppointmentsPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await getAppointments(controller.signal);
        setItems(data.map(mapAppointment));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Unable to load appointments');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <div className="dashboard-layout dashboard-tight">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content">
          <div className="appointments-page-section">
            <div className="apptfx-header-block">
            </div>
            <h2 className="apptfx-section-heading">Upcoming Appointments</h2>
            {error && <div className="apptfx-error" role="alert">{error}</div>}
            {loading && (
              <div className="apptfx-grid" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => <AppointmentSkeleton key={i} />)}
              </div>
            )}
            {!loading && items.length === 0 && !error && (
              <div className="apptfx-empty">No upcoming appointments scheduled.</div>
            )}
            {!loading && items.length > 0 && (
              <div className="apptfx-grid">
                {items.map(a => <AppointmentCard key={a.id} appt={a} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;

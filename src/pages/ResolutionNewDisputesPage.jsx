import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputes, mapDispute, createDispute } from '../services/resolutionCenter.service';
import { getBookings } from '../services/bookings.service';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

const NewDisputesPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await getDisputes('new', controller.signal);
        setItems(data.map(mapDispute));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load disputes');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // Fetch bookings when modal opens
  useEffect(() => {
    if (showCreate && bookings.length === 0) {
      const controller = new AbortController();
      (async () => {
        try {
          setLoadingBookings(true);
          const data = await getBookings(controller.signal);
          setBookings(data);
        } catch (e) {
          if (e.name !== 'AbortError') {
            console.error('Failed to load bookings:', e);
          }
        } finally {
          setLoadingBookings(false);
        }
      })();
      return () => controller.abort();
    }
  }, [showCreate, bookings.length]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content rcfx-page">
          <div className="rcfx-toolbar">
            <div className="rcfx-toolbar-left">
              <h2 className="rcfx-section-heading" style={{ margin: 0 }}>New Disputes</h2>
            </div>
            <button className="rcfx-btn rcfx-btn-primary" onClick={() => setShowCreate(true)}>New Dispute</button>
          </div>
          {error && <div className="rcfx-error" role="alert">{error}</div>}
          {loading && <div className="rcfx-loading">Loading...</div>}
          {!loading && items.length === 0 && !error && (
            <div className="rcfx-empty">No new disputes. Click "New Dispute" to create one.</div>
          )}
          <div className="rcfx-dispute-grid">
            {items.map(d => (
              <div key={d.id} className="rcfx-dispute-card">
                <div className="rcfx-dispute-body">
                  <div className="rcfx-dispute-line"><strong>Dispute ID:</strong> {d.code}</div>
                  <div className="rcfx-dispute-line"><strong>Order ID:</strong> {d.orderId}</div>
                  <div className="rcfx-dispute-line"><strong>Customer:</strong> {d.customer}</div>
                  <div className="rcfx-dispute-line rcfx-reason"><strong>Reason:</strong> {d.reason}</div>
                  <div className="rcfx-dispute-line"><strong>Raised On:</strong> {new Date(d.raisedAt).toLocaleString()}</div>
                </div>
                <button className="rcfx-btn rcfx-btn-primary" onClick={() => navigate(`/resolution-center/disputes/${d.id}`)}>Respond Now</button>
              </div>
            ))}
          </div>
          {showCreate && (
            <div className="rcfx-modal" role="dialog" aria-modal="true" aria-labelledby="rcfx-create-title">
              <div className="rcfx-modal-dialog">
                <div className="rcfx-modal-header">
                  <div id="rcfx-create-title" className="rcfx-modal-title">Create Dispute</div>
                </div>
                <div className="rcfx-modal-body">
                  <label className="rcfx-label">Order/Booking</label>
                  <select
                    className="rcfx-chat-input"
                    value={selectedBookingId}
                    onChange={e => setSelectedBookingId(e.target.value)}
                    disabled={loadingBookings}
                  >
                    <option value="">Select a booking (optional)</option>
                    {bookings.map(booking => (
                      <option key={booking.id} value={booking.id}>
                        {booking.bookingNumber} - {booking.customerName} ({booking.serviceName})
                      </option>
                    ))}
                  </select>
                  {loadingBookings && <p className="rcfx-label" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>Loading bookings...</p>}
                  
                  <label className="rcfx-label" style={{ marginTop: '16px' }}>Subject</label>
                  <input
                    className="rcfx-chat-input"
                    placeholder="Short summary (e.g., Incorrect charge on invoice)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                  <label className="rcfx-label">Initial message (optional)</label>
                  <textarea
                    className="rcfx-textarea"
                    rows={4}
                    placeholder="Provide relevant details to help us resolve this quickly"
                    value={initialMessage}
                    onChange={e => setInitialMessage(e.target.value)}
                  />
                </div>
                <div className="rcfx-modal-footer">
                  <button className="rcfx-btn" onClick={() => {
                    setShowCreate(false);
                    setSelectedBookingId('');
                    setSubject('');
                    setInitialMessage('');
                  }} disabled={creating}>Cancel</button>
                  <button
                    className="rcfx-btn rcfx-btn-primary"
                    onClick={async () => {
                      if (!subject.trim()) return;
                      try {
                        setCreating(true);
                        const created = await createDispute({ 
                          subject: subject.trim(), 
                          message: initialMessage.trim(),
                          bookingId: selectedBookingId || undefined
                        });
                        setShowCreate(false);
                        setSubject('');
                        setInitialMessage('');
                        setSelectedBookingId('');
                        if (created?.id) navigate(`/resolution-center/disputes/${created.id}`);
                        else {
                          // Fallback: reload list
                          const data = await getDisputes('new');
                          setItems(data.map(mapDispute));
                        }
                      } catch (err) {
                        setError('Failed to create dispute');
                      } finally {
                        setCreating(false);
                      }
                    }}
                    disabled={creating || !subject.trim()}
                  >{creating ? 'Creating...' : 'Create Dispute'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewDisputesPage;

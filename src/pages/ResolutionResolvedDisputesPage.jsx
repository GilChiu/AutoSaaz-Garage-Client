import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputes, mapDispute } from '../services/resolutionCenter.service';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

const ResolvedDisputesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const data = await getDisputes('resolved', controller.signal);
        setItems(data.map(mapDispute));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load resolved');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content rcfx-page">
          {/* Removed duplicate header (UpperNavbar provides title/subtitle) */}
          <h2 className="rcfx-section-heading">Resolved Cases</h2>
          {error && <div className="rcfx-error" role="alert">{error}</div>}
          {loading && <div className="rcfx-loading">Loading...</div>}
          {!loading && items.length === 0 && !error && <div className="rcfx-empty">No resolved cases.</div>}
          <div className="rcfx-dispute-grid">
            {items.map(d => (
              <div key={d.id} className="rcfx-dispute-card" data-status="resolved">
                <div className="rcfx-dispute-body">
                  <div className="rcfx-dispute-line"><strong>Dispute ID:</strong> {d.code}</div>
                  <div className="rcfx-dispute-line"><strong>Order ID:</strong> {d.orderId}</div>
                  <div className="rcfx-dispute-line"><strong>Customer:</strong> {d.customer}</div>
                  <div className="rcfx-dispute-line"><strong>Resolution:</strong> {d.resolution || '—'}</div>
                  <div className="rcfx-dispute-line"><strong>Date:</strong> {d.resolvedAt ? new Date(d.resolvedAt).toLocaleDateString() : '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolvedDisputesPage;

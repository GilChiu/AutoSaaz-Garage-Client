import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputes, mapDispute } from '../services/resolutionCenter.service';
import cache from '../utils/cache';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

const ResolvedDisputesPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    // Invalidate resolution-center cache to force fresh data
    cache.invalidatePattern('resolution-center');
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDisputes('resolved', controller.signal);
        setItems(data.map(mapDispute));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load resolved');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [refreshKey]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content rcfx-page">
          {/* Removed duplicate header (UpperNavbar provides title/subtitle) */}
          <div className="rcfx-toolbar">
            <div className="rcfx-toolbar-left">
              <h2 className="rcfx-section-heading" style={{ margin: 0 }}>Resolved Cases</h2>
            </div>
            <button className="rcfx-btn" onClick={handleRefresh} disabled={loading} title="Refresh resolved cases">
              🔄 Refresh
            </button>
          </div>
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
                  <div className="rcfx-dispute-line"><strong>Date Created:</strong> {d.raisedAt ? new Date(d.raisedAt).toLocaleString() : '—'}</div>
                  <div className="rcfx-dispute-line"><strong>Date Resolved:</strong> {d.resolvedAt ? new Date(d.resolvedAt).toLocaleString() : '—'}</div>
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

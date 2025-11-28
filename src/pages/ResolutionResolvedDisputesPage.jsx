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
  }, []);

  // Poll for updates every 10 seconds to detect newly resolved disputes
  useEffect(() => {
    const pollInterval = setInterval(async () => {
      try {
        // Invalidate cache before polling to get fresh data
        cache.invalidate('/resolution-center?status=resolved');
        const data = await getDisputes('resolved');
        const mapped = data.map(mapDispute);
        
        // Only update if the list has changed (new dispute was resolved)
        if (mapped.length !== items.length) {
          setItems(mapped);
        }
      } catch (e) {
        // Silent fail for polling
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [items.length]);

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

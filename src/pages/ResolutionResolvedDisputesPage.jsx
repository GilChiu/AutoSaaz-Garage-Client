import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputes, mapDispute } from '../services/resolutionCenter.service';
import cache from '../utils/cache';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

// Create Supabase client
const getSupabaseClient = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  if (token) {
    client.auth.setSession({
      access_token: token,
      refresh_token: token
    });
  }
  return client;
};

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

  // Real-time subscription for newly resolved disputes
  useEffect(() => {
    const supabase = getSupabaseClient();

    // Subscribe to disputes table for any changes
    const channel = supabase
      .channel('resolved-disputes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'disputes'
        },
        async () => {
          // Refresh the resolved disputes list when any change occurs
          try {
            cache.invalidate('/resolution-center?status=resolved');
            const data = await getDisputes('resolved');
            const mapped = data.map(mapDispute);
            setItems(mapped);
          } catch (e) {
            console.error('Failed to refresh resolved disputes:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

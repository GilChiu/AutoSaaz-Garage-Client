import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { getDisputeById, mapDisputeDetail, postDisputeMessage } from '../services/resolutionCenter.service';
import '../components/Dashboard/Dashboard.css';
import '../styles/resolution-center.css';

const DisputeChatPage = () => {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const raw = await getDisputeById(id, controller.signal);
        setDispute(mapDisputeDetail(raw));
      } catch (e) {
        if (e.name !== 'AbortError') setError('Failed to load dispute');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      setSending(true);
      const newMsg = await postDisputeMessage(id, message.trim());
      if (newMsg) setDispute(prev => ({ ...prev, messages: [...prev.messages, newMsg] }));
      setMessage('');
    } catch (e) {
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content rcfx-page">
          {/* Removed duplicate header (UpperNavbar provides title/subtitle) */}
          {loading && <div className="rcfx-loading">Loading dispute...</div>}
          {!loading && !dispute && <div className="rcfx-error">Dispute not found.</div>}
          {!loading && dispute && (
            <div className="rcfx-chat-wrapper">
              <div className="rcfx-section-heading">Dispute Chat</div>
              <div className="rcfx-chat-box">
                <div className="rcfx-messages" role="log" aria-live="polite">
                  {dispute.messages.map(m => (
                    <div key={m.id} className={`rcfx-msg rcfx-msg-${m.from}`}> 
                      <div className="rcfx-msg-text">{m.text}</div>
                      <div className="rcfx-msg-time">{new Date(m.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  ))}
                </div>
                <div className="rcfx-chat-input-row">
                  <input
                    className="rcfx-chat-input"
                    placeholder="Type your message to admin..."
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                  />
                  <button className="rcfx-btn rcfx-btn-primary" disabled={sending} onClick={sendMessage}>{sending ? 'Sending...' : 'Send'}</button>
                </div>
              </div>
            </div>
          )}
          {error && <div className="rcfx-error" role="alert">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default DisputeChatPage;

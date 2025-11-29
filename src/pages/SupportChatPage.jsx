import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { getTicketDetail, addTicketMessage } from '../services/support.service';
import { formatCompactDateTimeGST } from '../utils/gstDateTime';
import '../components/Dashboard/Dashboard.css';

const SupportChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchTicketDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Polling for new messages (realtime doesn't work with custom JWT auth)
  useEffect(() => {
    if (!id) return;

    let isActive = true;
    let lastMessageCount = ticket?.conversation?.length || 0;
    
    // Poll every 3 seconds for responsive updates
    const pollInterval = setInterval(async () => {
      if (!isActive) return;
      try {
        const updated = await getTicketDetail(id);
        if (updated && updated.conversation?.length > lastMessageCount) {
          lastMessageCount = updated.conversation.length;
          if (isActive) setTicket(updated);
          
          // Auto-scroll to new message
          setTimeout(() => scrollToBottom(), 100);
        } else if (updated) {
          lastMessageCount = updated.conversation?.length || 0;
          // Update if status changed even without new messages
          if (updated.ticket?.status !== ticket?.ticket?.status && isActive) {
            setTicket(updated);
          }
        }
      } catch (e) {
        // Silent fail for polling
      }
    }, 3000);

    return () => {
      isActive = false;
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ticket?.conversation?.length, ticket?.ticket?.status]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketDetail = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await getTicketDetail(id);
      setTicket(data);
      setError(null);
    } catch (e) {
      if (!silent) {
        setError(e?.message || 'Failed to load ticket');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      await addTicketMessage(id, message.trim());
      setMessage('');
      await fetchTicketDetail(true);
    } catch (e) {
      alert('Failed to send message: ' + (e?.message || 'Unknown error'));
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return formatCompactDateTimeGST(dateString);
  };

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-yellow-100 text-yellow-700',
      'in_progress': 'bg-blue-100 text-blue-700',
      'resolved': 'bg-green-100 text-green-700',
      'closed': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatStatus = (status) => {
    const statusMap = {
      'open': 'Open',
      'in_progress': 'In Progress',
      'resolved': 'Resolved',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-layout-main">
          <div className="dashboard-layout-content">
            <div className="loading-state">Loading ticket...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-layout-main">
          <div className="dashboard-layout-content">
            <div className="error-state">
              <p>{error || 'Ticket not found'}</p>
              <button className="btn primary" onClick={() => navigate('/support')}>
                Back to Support
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isResolved = ticket.ticket.status === 'resolved' || ticket.ticket.status === 'closed';

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content">
          <div className="header-row">
            <button className="back-button" onClick={() => navigate('/support')}>
              ← Back to Support
            </button>
          </div>

          <div className="ticket-header">
            <div className="ticket-info">
              <h1 className="ticket-title">
                Ticket #{ticket.ticket.ticketNumber}
              </h1>
              <h2 className="ticket-subject">{ticket.ticket.subject}</h2>
            </div>
            <span className={`badge ${getStatusColor(ticket.ticket.status)}`}>
              {formatStatus(ticket.ticket.status)}
            </span>
          </div>

          <div className="chat-container">
            <div className="messages-container">
              {ticket.conversation && ticket.conversation.length > 0 ? (
                ticket.conversation.map((msg) => {
                  const isGarage = msg.senderType === 'garage';
                  return (
                    <div key={msg.id} className={`message ${isGarage ? 'message-garage' : 'message-admin'}`}>
                      <div className="message-header">
                        <span className="message-sender">{msg.senderName}</span>
                        <span className="message-time">{formatDate(msg.createdAt)}</span>
                      </div>
                      <div className="message-body">{msg.body}</div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-messages">No messages yet</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {!isResolved && (
              <div className="message-input-container">
                <textarea
                  className="message-input"
                  placeholder="Type your message to admin..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows="3"
                />
                <button
                  className="btn primary send-button"
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            )}

            {isResolved && (
              <div className="resolved-notice">
                This ticket has been {ticket.ticket.status}. No further messages can be sent.
              </div>
            )}
          </div>

          <style>{`
            .loading-state, .error-state {
              text-align: center;
              padding: 60px 20px;
              color: #6b7280;
            }

            .error-state p {
              margin-bottom: 20px;
              color: #dc2626;
            }

            .header-row {
              margin-bottom: 20px;
            }

            .back-button {
              background: none;
              border: none;
              color: #fb923c;
              font-weight: 500;
              cursor: pointer;
              padding: 8px 0;
              font-size: 14px;
            }

            .back-button:hover {
              color: #f97316;
            }

            .ticket-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 24px;
              padding: 20px;
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
            }

            .ticket-info {
              flex: 1;
            }

            .ticket-title {
              font-size: 18px;
              font-weight: 600;
              color: #6b7280;
              margin-bottom: 8px;
            }

            .ticket-subject {
              font-size: 24px;
              font-weight: 700;
              color: #111827;
            }

            .badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 12px;
              font-size: 13px;
              font-weight: 500;
            }

            .chat-container {
              background: #fff;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
            }

            .messages-container {
              padding: 20px;
              min-height: 400px;
              max-height: 600px;
              overflow-y: auto;
            }

            .message {
              margin-bottom: 16px;
              padding: 12px 16px;
              border-radius: 8px;
              max-width: 70%;
            }

            .message-garage {
              background: #eff6ff;
              margin-left: auto;
              border-left: 3px solid #3b82f6;
            }

            .message-admin {
              background: #f3f4f6;
              margin-right: auto;
              border-left: 3px solid #fb923c;
            }

            .message-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }

            .message-sender {
              font-weight: 600;
              font-size: 13px;
              color: #111827;
            }

            .message-time {
              font-size: 11px;
              color: #6b7280;
            }

            .message-body {
              font-size: 14px;
              color: #374151;
              line-height: 1.5;
              white-space: pre-wrap;
            }

            .empty-messages {
              text-align: center;
              padding: 60px 20px;
              color: #9ca3af;
              font-size: 14px;
            }

            .message-input-container {
              padding: 20px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              gap: 12px;
              align-items: flex-end;
            }

            .message-input {
              flex: 1;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              padding: 10px 12px;
              font-size: 14px;
              resize: none;
              font-family: inherit;
            }

            .message-input:focus {
              outline: none;
              border-color: #fb923c;
              box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1);
            }

            .send-button {
              padding: 10px 24px;
              white-space: nowrap;
            }

            .btn {
              border: 1px solid #d1d5db;
              background: #fff;
              padding: 10px 20px;
              border-radius: 6px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }

            .btn.primary {
              background: #fb923c;
              color: #fff;
              border-color: #fb923c;
            }

            .btn.primary:hover:not(:disabled) {
              background: #f97316;
            }

            .btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }

            .resolved-notice {
              padding: 20px;
              background: #f3f4f6;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }

            .bg-yellow-100 { background-color: #fef3c7; }
            .text-yellow-700 { color: #a16207; }
            .bg-blue-100 { background-color: #dbeafe; }
            .text-blue-700 { color: #1d4ed8; }
            .bg-green-100 { background-color: #d1fae5; }
            .text-green-700 { color: #047857; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .text-gray-700 { color: #374151; }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default SupportChatPage;

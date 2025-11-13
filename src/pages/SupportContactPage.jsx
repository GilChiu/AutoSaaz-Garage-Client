import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Dashboard/Sidebar';
import { createSupportTicket, getGarageTickets } from '../services/support.service';
import '../components/Dashboard/Dashboard.css';

const SupportContactPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new'); // 'new' or 'tickets'
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  // Tickets list
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState('');

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setTicketsError('');
      const data = await getGarageTickets();
      setTickets(data);
    } catch (e) {
      setTicketsError(e?.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const update = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      await createSupportTicket({
        contactName: form.name,
        contactEmail: form.email,
        subject: form.subject,
        message: form.message,
        source: 'garage-portal',
      });
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => {
        setSubmitted(false);
        setActiveTab('tickets');
      }, 2000);
    } catch (e) {
      setError(e?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-600',
      'normal': 'bg-blue-100 text-blue-600',
      'high': 'bg-orange-100 text-orange-600',
      'urgent': 'bg-red-100 text-red-600'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
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

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content">
          <h1 className="page-title">Support</h1>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              Contact Us
            </button>
            <button
              className={`tab-button ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              My Tickets
            </button>
          </div>

          {/* New Ticket Form */}
          {activeTab === 'new' && (
            <div className="card">
              <div className="card-header">
                <h2>Contact Us</h2>
                <p className="muted">Fill in the form and our admin team will get back to you.</p>
              </div>

              {submitted ? (
                <div className="alert success">Your message has been sent. We will reach out shortly.</div>
              ) : (
                <form onSubmit={onSubmit} className="form-grid">
                  {error && <div className="alert error" role="alert">{error}</div>}

                  <div className="grid-cols-2">
                    <div className="form-field">
                      <label>Full Name <span className="req">*</span></label>
                      <input type="text" value={form.name} onChange={update('name')} placeholder="Enter full name" />
                    </div>
                    <div className="form-field">
                      <label>Email <span className="req">*</span></label>
                      <input type="email" value={form.email} onChange={update('email')} placeholder="name@example.com" />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Subject <span className="req">*</span></label>
                    <input type="text" value={form.subject} onChange={update('subject')} placeholder="Brief subject" />
                  </div>

                  <div className="form-field">
                    <label>Problem / Message <span className="req">*</span></label>
                    <textarea value={form.message} onChange={update('message')} placeholder="Describe the problem" rows={6} />
                  </div>

                  <div className="actions">
                    <button type="submit" className="btn primary" disabled={submitting}>
                      {submitting ? 'Sending...' : 'Send Message'}
                    </button>
                    <button 
                      type="button" 
                      className="btn" 
                      onClick={() => setForm({ name: '', email: '', subject: '', message: '' })}
                    >
                      Clear
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tickets List */}
          {activeTab === 'tickets' && (
            <div className="card">
              <div className="card-header">
                <h2>My Support Tickets</h2>
                <p className="muted">View and track your support requests</p>
              </div>

              {loading && <div className="loading-state">Loading tickets...</div>}
              
              {!loading && ticketsError && (
                <div className="alert error">{ticketsError}</div>
              )}

              {!loading && !ticketsError && tickets.length === 0 && (
                <div className="empty-state">
                  <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <h3>No support tickets yet</h3>
                  <p>Create a new ticket using the Contact Us form</p>
                  <button className="btn primary" onClick={() => setActiveTab('new')}>
                    Create Ticket
                  </button>
                </div>
              )}

              {!loading && !ticketsError && tickets.length > 0 && (
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>TICKET ID</th>
                        <th>SUBJECT</th>
                        <th>PRIORITY</th>
                        <th>STATUS</th>
                        <th>AGE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map(ticket => (
                        <tr key={ticket.id}>
                          <td>{ticket.ticketNumber}</td>
                          <td className="max-w-xs truncate" title={ticket.subject}>
                            {ticket.subject}
                          </td>
                          <td>
                            <span className={`badge ${getPriorityColor(ticket.priority)}`}>
                              {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${getStatusColor(ticket.status)}`}>
                              {formatStatus(ticket.status)}
                            </span>
                          </td>
                          <td>{ticket.age}</td>
                          <td>
                            <button 
                              className="btn-action"
                              onClick={() => navigate(`/support/chat/${ticket.id}`)}
                            >
                              Open Chat
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <style>{`
            .page-title { 
              font-size: 24px; 
              font-weight: 700; 
              margin-bottom: 20px; 
              color: #111827;
            }
            
            .tab-navigation {
              display: flex;
              gap: 8px;
              margin-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
            }
            
            .tab-button {
              padding: 12px 24px;
              background: none;
              border: none;
              border-bottom: 2px solid transparent;
              margin-bottom: -2px;
              font-weight: 500;
              color: #6b7280;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .tab-button:hover {
              color: #111827;
            }
            
            .tab-button.active {
              color: #fb923c;
              border-bottom-color: #fb923c;
            }
            
            .card { 
              background: #fff; 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
            }
            
            .card-header { 
              padding: 20px; 
              border-bottom: 1px solid #e5e7eb;
            }
            
            .card-header h2 {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 4px;
              color: #111827;
            }
            
            .muted { 
              color: #6b7280; 
              font-size: 14px; 
            }
            
            .form-grid { 
              padding: 20px; 
              display: grid; 
              gap: 16px; 
            }
            
            .grid-cols-2 { 
              display: grid; 
              grid-template-columns: repeat(1, minmax(0, 1fr)); 
              gap: 16px; 
            }
            
            @media (min-width: 768px) { 
              .grid-cols-2 { 
                grid-template-columns: repeat(2, minmax(0, 1fr)); 
              } 
            }
            
            .form-field label { 
              display: block; 
              font-size: 14px; 
              font-weight: 500;
              margin-bottom: 6px; 
              color: #111827; 
            }
            
            .req { 
              color: #dc2626; 
            }
            
            input, textarea { 
              width: 100%; 
              border: 1px solid #d1d5db; 
              border-radius: 6px; 
              padding: 10px 12px; 
              font-size: 14px; 
              outline: none;
              transition: all 0.2s;
            }
            
            input:focus, textarea:focus { 
              border-color: #fb923c; 
              box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.1); 
            }
            
            .actions { 
              display: flex; 
              gap: 12px; 
              padding-top: 8px; 
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
            
            .btn:hover {
              background: #f9fafb;
            }
            
            .btn.primary { 
              background: #fb923c; 
              color: #fff; 
              border-color: #fb923c; 
            }
            
            .btn.primary:hover { 
              background: #f97316; 
            }
            
            .btn:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            
            .alert { 
              padding: 12px 16px; 
              border-radius: 6px; 
              margin: 16px 20px; 
              font-size: 14px;
            }
            
            .alert.success { 
              background: #ecfdf5; 
              color: #065f46; 
              border: 1px solid #a7f3d0; 
            }
            
            .alert.error { 
              background: #fef2f2; 
              color: #991b1b; 
              border: 1px solid #fecaca; 
            }
            
            .loading-state {
              text-align: center;
              padding: 60px 20px;
              color: #6b7280;
              font-size: 14px;
            }
            
            .empty-state {
              text-align: center;
              padding: 60px 20px;
            }
            
            .empty-icon {
              width: 64px;
              height: 64px;
              margin: 0 auto 16px;
              color: #d1d5db;
            }
            
            .empty-state h3 {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
              color: #111827;
            }
            
            .empty-state p {
              color: #6b7280;
              margin-bottom: 20px;
            }
            
            .table-wrapper {
              overflow-x: auto;
            }
            
            .data-table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .data-table thead {
              background: #f9fafb;
            }
            
            .data-table th {
              padding: 12px 20px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              color: #6b7280;
              text-transform: uppercase;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .data-table td {
              padding: 16px 20px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 14px;
              color: #111827;
            }
            
            .data-table tbody tr:hover {
              background: #f9fafb;
            }
            
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: 500;
            }
            
            .btn-action {
              background: #fb923c;
              color: #fff;
              border: none;
              padding: 6px 16px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .btn-action:hover {
              background: #f97316;
            }
            
            .max-w-xs {
              max-width: 300px;
            }
            
            .truncate {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default SupportContactPage;

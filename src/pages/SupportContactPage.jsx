import React, { useState } from 'react';
import { createSupportTicket } from '../services/support.service';

// Front-end only: prepares payload for easy API hookup later
const SupportContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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
    } catch (e) {
      setError(e?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Support</h1>

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
              <button type="submit" className="btn primary" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</button>
              <button type="reset" className="btn" onClick={() => setForm({ name: '', email: '', subject: '', message: '' })}>Clear</button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .page-container { padding: 24px; }
        .page-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
        .card-header { padding: 16px 16px 0 16px; }
        .muted { color: #6b7280; font-size: 14px; margin-top: 4px; }
        .form-grid { padding: 16px; display: grid; gap: 16px; }
        .grid-cols-2 { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)); gap: 16px; }
        @media (min-width: 768px) { .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        .form-field label { display: block; font-size: 14px; margin-bottom: 6px; color: #111827; }
        .req { color: #dc2626; }
        input, textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 6px; padding: 8px 12px; font-size: 14px; outline: none; }
        input:focus, textarea:focus { border-color: #fb923c; box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.25); }
        .actions { display: flex; gap: 12px; padding-top: 8px; }
        .btn { border: 1px solid #d1d5db; background: #fff; padding: 8px 14px; border-radius: 6px; }
        .btn.primary { background: #fb923c; color: #fff; border-color: #fb923c; }
        .btn.primary:hover { background: #f97316; }
        .alert { padding: 12px 14px; border-radius: 6px; margin: 12px 16px; }
        .alert.success { background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert.error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
      `}</style>
    </div>
  );
};

export default SupportContactPage;

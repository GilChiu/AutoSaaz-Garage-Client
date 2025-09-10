import React, { useState } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsAccount.css';

const SettingsAccountPage = () => {
  const [form, setForm] = useState({
    email: 'info@autosaaz.com',
    phone: '+971 50 123 4567',
    password: '**********',
    language: 'English',
    timezone: 'GMT+4 (Dubai)'
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const change = e => { const { name, value } = e.target; setForm(f => ({ ...f, [name]: value })); setSaved(false); };
  const submit = e => { e.preventDefault(); setSaving(true); setTimeout(() => { setSaving(false); setSaved(true); }, 600); };

  return (
    <div className="dashboard-layout dashboard-tight">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content">
          <div className="settings-account-wrapper">
            <div className="settings-card account-settings-card">
              <div className="settings-card-header">
                <span className="bar" aria-hidden="true" />
                <h2>Account Settings</h2>
              </div>
              <form onSubmit={submit} className="account-form">
                <label className="settings-field">
                  <span className="settings-label">Email Address</span>
                  <input name="email" type="email" value={form.email} onChange={change} />
                </label>
                <label className="settings-field">
                  <span className="settings-label">Phone Number</span>
                  <input name="phone" value={form.phone} onChange={change} />
                </label>
                <label className="settings-field">
                  <span className="settings-label">Password</span>
                  <input name="password" type="password" value={form.password.replace(/./g,'*')} onChange={change} />
                </label>
                <label className="settings-field">
                  <span className="settings-label">Language Preference</span>
                  <select name="language" value={form.language} onChange={change}>
                    <option>English</option>
                    <option>Arabic</option>
                  </select>
                </label>
                <label className="settings-field">
                  <span className="settings-label">Time Zone</span>
                  <select name="timezone" value={form.timezone} onChange={change}>
                    <option>GMT+4 (Dubai)</option>
                    <option>GMT+3 (Riyadh)</option>
                  </select>
                </label>
                <div className="settings-actions account-actions">
                  <button type="submit" className="settings-primary-btn" disabled={saving}>{saving ? 'Saving...' : 'Save Details'}</button>
                  {saved && <span className="settings-save-indicator" role="status">Saved</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAccountPage;

import React, { useState, useRef } from 'react';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsProfile.css';

const SettingsProfilePage = () => {
  const [profile, setProfile] = useState({
    businessName: 'AutoSaaz Garage',
    description: 'We specialize in luxury and regular vehicle repairs including hybrid models.',
    location: 'Al Quoz Industrial Area, Dubai',
    workingHours: 'Sat–Thu, 9 AM – 9 PM',
    offDays: 'Friday and Public Holidays'
  });
  const [logo, setLogo] = useState(null); // data URL preview
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
    setSaved(false);
  };

  const handleLogoClick = () => fileInputRef.current?.click();
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => { setLogo(ev.target?.result); };
      reader.readAsDataURL(file);
      setSaved(false);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    // mock async save
    setTimeout(() => { setSaving(false); setSaved(true); }, 700);
  };

  return (
    <div className="dashboard-layout dashboard-tight">
      <Sidebar />
      <div className="dashboard-layout-main">
        <div className="dashboard-layout-content">
          <div className="settings-profile-wrapper">
            <div className="settings-card profile-settings-card">
              <div className="settings-card-header">
                <span className="bar" aria-hidden="true" />
                <h2>Profile Settings</h2>
              </div>
              <form className="profile-form" onSubmit={handleSave}>
                <div className="profile-avatar-block">
                  <button type="button" className="profile-avatar-btn" onClick={handleLogoClick} aria-label="Upload business logo">
                    <div className="profile-avatar-circle">
                      {logo ? <img src={logo} alt="Business logo preview" /> : <span className="avatar-letter" aria-hidden="true">A</span>}
                      <span className="camera-badge" aria-hidden="true">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                      </span>
                    </div>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleLogoChange} />
                </div>
                <div className="profile-fields">
                  <label className="settings-field full">
                    <span className="settings-label">Business Name</span>
                    <input name="businessName" value={profile.businessName} onChange={handleChange} placeholder="AutoSaaz Garage" />
                  </label>
                  <label className="settings-field full">
                    <span className="settings-label">Description</span>
                    <textarea name="description" value={profile.description} onChange={handleChange} rows={3} placeholder="Brief description of your garage services" />
                  </label>
                  <label className="settings-field full">
                    <span className="settings-label">Location</span>
                    <input name="location" value={profile.location} onChange={handleChange} placeholder="Business physical address" />
                  </label>
                  <div className="profile-two-col">
                    <label className="settings-field">
                      <span className="settings-label">Working Hours</span>
                      <input name="workingHours" value={profile.workingHours} onChange={handleChange} placeholder="e.g., Sat–Thu, 9 AM – 9 PM" />
                    </label>
                    <label className="settings-field">
                      <span className="settings-label">Off Days / Holidays</span>
                      <input name="offDays" value={profile.offDays} onChange={handleChange} placeholder="e.g., Friday and Public Holidays" />
                    </label>
                  </div>
                </div>
                <div className="settings-actions profile-actions">
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

export default SettingsProfilePage;

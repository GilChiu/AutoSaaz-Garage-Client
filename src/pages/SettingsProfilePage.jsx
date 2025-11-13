import React, { useState, useRef, useEffect } from 'react';
import { getGarageProfile, updateGarageProfile } from '../services/profile.service';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsProfile.css';

const SettingsProfilePage = () => {
  const [profile, setProfile] = useState({
    garageName: '',
    description: '',
    location: '',
    workingHours: '',
    offDays: '',
    logoUrl: ''
  });
  const [logo, setLogo] = useState(null); // Preview URL
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Load profile data on component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getGarageProfile();
      console.log('Profile loaded:', response);

      if (response.success && response.data?.profile) {
        const profileData = response.data.profile;
        
        setProfile({
          garageName: profileData.garageName || '',
          description: profileData.description || '',
          location: profileData.location || '',
          workingHours: profileData.workingHours || '',
          offDays: profileData.offDays || '',
          logoUrl: profileData.logoUrl || ''
        });

        // Set logo preview if available
        if (profileData.logoUrl) {
          setLogo(profileData.logoUrl);
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
    setSaved(false);
    setError('');
    
    // Update logo preview when logoUrl changes
    if (name === 'logoUrl') {
      setLogo(value || null);
    }
  };

  const handleLogoClick = () => fileInputRef.current?.click();
  
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create local preview only - user will need to upload separately and paste URL
      const reader = new FileReader();
      reader.onload = ev => { 
        setLogo(ev.target?.result);
        // Show message about manual upload
        setError('Please upload this image to your preferred hosting service (e.g., Imgur, Cloudinary) and paste the URL in the Logo URL field below.');
      };
      reader.readAsDataURL(file);
      setSaved(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      // Update profile with all fields including logoUrl
      const updateData = {
        garageName: profile.garageName,
        description: profile.description,
        location: profile.location,
        workingHours: profile.workingHours,
        offDays: profile.offDays,
        logoUrl: profile.logoUrl || null,
      };

      console.log('Updating profile with data:', updateData);

      const response = await updateGarageProfile(updateData);
      
      if (response.success) {
        setSaved(true);
        
        // Update logo preview with saved URL
        if (response.data?.profile?.logoUrl) {
          setLogo(response.data.profile.logoUrl);
        }
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
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
              
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  Loading profile...
                </div>
              ) : (
                <form className="profile-form" onSubmit={handleSave}>
                  {error && (
                    <div style={{ 
                      padding: '12px 16px', 
                      backgroundColor: '#fee', 
                      border: '1px solid #fcc', 
                      borderRadius: '8px', 
                      color: '#c33',
                      marginBottom: '20px'
                    }}>
                      {error}
                    </div>
                  )}
                  
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
                      <input 
                        name="garageName" 
                        value={profile.garageName} 
                        onChange={handleChange} 
                        placeholder="Enter your garage name" 
                      />
                    </label>
                    <label className="settings-field full">
                      <span className="settings-label">Logo URL (Optional)</span>
                      <input 
                        name="logoUrl" 
                        value={profile.logoUrl} 
                        onChange={handleChange} 
                        placeholder="https://example.com/your-logo.jpg" 
                        type="url"
                      />
                      <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                        Upload your logo to a hosting service (e.g., Imgur, Cloudinary) and paste the URL here
                      </small>
                    </label>
                    <label className="settings-field full">
                      <span className="settings-label">Description</span>
                      <textarea 
                        name="description" 
                        value={profile.description} 
                        onChange={handleChange} 
                        rows={3} 
                        placeholder="Brief description of your garage services" 
                      />
                    </label>
                    <label className="settings-field full">
                      <span className="settings-label">Location</span>
                      <input 
                        name="location" 
                        value={profile.location} 
                        onChange={handleChange} 
                        placeholder="Business physical address" 
                      />
                    </label>
                    <div className="profile-two-col">
                      <label className="settings-field">
                        <span className="settings-label">Working Hours</span>
                        <input 
                          name="workingHours" 
                          value={profile.workingHours} 
                          onChange={handleChange} 
                          placeholder="e.g., Sat–Thu, 9 AM – 9 PM" 
                        />
                      </label>
                      <label className="settings-field">
                        <span className="settings-label">Off Days / Holidays</span>
                        <input 
                          name="offDays" 
                          value={profile.offDays} 
                          onChange={handleChange} 
                          placeholder="e.g., Friday and Public Holidays" 
                        />
                      </label>
                    </div>
                  </div>
                  <div className="settings-actions profile-actions">
                    <button type="submit" className="settings-primary-btn" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Details'}
                    </button>
                    {saved && <span className="settings-save-indicator" role="status">Saved</span>}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsProfilePage;

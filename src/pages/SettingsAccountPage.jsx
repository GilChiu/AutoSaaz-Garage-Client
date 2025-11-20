import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/profileApi';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsAccount.css';

const SettingsAccountPage = () => {
  const { user } = useAuth(); // Get the current logged-in user
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    email: '',
    phone: '',
    language: 'English',
    timezone: 'GMT+4 (Dubai)'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Load user data when component mounts or user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setLoading(true);
        setError('');
        
        try {
          console.log('Loading user profile...');
          
          // Always start with user data from context
          let formData = {
            email: user.email || '',
            phone: '',
            language: 'English',
            timezone: 'GMT+4 (Dubai)'
          };

          // Try to fetch additional profile data
          try {
            const profileResponse = await getUserProfile();
            console.log('Profile data:', profileResponse);
            
            if (profileResponse.success && profileResponse.data?.profile) {
              const profile = profileResponse.data.profile;
              formData.email = profile.email || formData.email;
              formData.phone = profile.phoneNumber || formData.phone;
              formData.language = profile.language || formData.language;
              formData.timezone = profile.timezone || formData.timezone;
            }
          } catch (profileError) {
            console.warn('Failed to load profile, using defaults:', profileError.message);
          }

          // Set the form data
          setForm(formData);
        } catch (err) {
          console.error('Error loading user data:', err);
          setError('Failed to load user data. Please refresh the page.');
          
          // Fallback to user context data
          setForm({
            email: user.email || '',
            phone: '',
            language: 'English',
            timezone: 'GMT+4 (Dubai)'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserData();
  }, [user]);

  // Show loading state if user data is not loaded yet
  if (!user) {
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
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  Loading user data...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const change = e => { 
    const { name, value } = e.target; 
    setForm(f => ({ ...f, [name]: value })); 
    setSaved(false); 
    setError('');
  };

  const submit = async (e) => { 
    e.preventDefault(); 
    setSaving(true); 
    setError('');
    
    try {
      console.log('Updating user profile:', form);
      
      const response = await updateUserProfile({
        email: form.email,
        phone: form.phone,
        language: form.language,
        timezone: form.timezone
      });

      if (response.success) {
        setSaved(true);
        console.log('Profile updated successfully');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSaved(false);
        }, 3000);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    // Navigate to forgot password page with current email pre-filled
    navigate('/forgot-password', { state: { email: form.email } });
  };

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
              
              {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                  Loading user data...
                </div>
              )}
              
              {error && (
                <div style={{ padding: '12px', marginBottom: '16px', backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33', borderRadius: '6px' }}>
                  {error}
                </div>
              )}
              
              {!loading && (
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
                  <div className="password-change-container">
                    <div className="password-dots">••••••••••</div>
                    <button 
                      type="button" 
                      className="change-password-btn" 
                      onClick={handleChangePassword}
                    >
                      Change Password
                    </button>
                  </div>
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Click "Change Password" to reset your password via email verification.
                  </small>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsAccountPage;

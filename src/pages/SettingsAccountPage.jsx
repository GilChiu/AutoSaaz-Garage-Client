import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserPassword, updateUserProfile } from '../services/profileApi';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsAccount.css';

const SettingsAccountPage = () => {
  const { user } = useAuth(); // Get the current logged-in user
  
  const [form, setForm] = useState({
    email: '',
    phone: '',
    password: '', // Will be fetched from backend API
    language: 'English',
    timezone: 'GMT+4 (Dubai)'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  // Load user data when component mounts or user changes
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setLoading(true);
        setError('');
        
        try {
          console.log('Loading user profile and password...');
          
          // Fetch user profile and password in parallel
          const [profileResponse, passwordResponse] = await Promise.all([
            getUserProfile(),
            getUserPassword()
          ]);

          console.log('Profile data:', profileResponse);
          console.log('Password data:', passwordResponse);

          // Set form data from API responses
          if (profileResponse.success && profileResponse.data) {
            const profile = profileResponse.data.profile;
            setForm({
              email: profile?.email || user.email || '',
              phone: profile?.phoneNumber || '',
              password: passwordResponse.success ? passwordResponse.data.password : 'Unable to load password',
              language: 'English',
              timezone: 'GMT+4 (Dubai)'
            });
          }
        } catch (err) {
          console.error('Error loading user data:', err);
          setError('Failed to load user data. Please refresh the page.');
          
          // Fallback to user context data
          setForm({
            email: user.email || '',
            phone: '',
            password: 'Unable to load password',
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
        password: form.password,
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

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
                  <div className="password-input-container">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      value={form.password} 
                      onChange={change} 
                      className="password-input"
                      placeholder="Your password"
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn" 
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {!localStorage.getItem('userGeneratedPassword') && (
                    <small style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      Your password was sent to your email during registration. If you can't find it, you can change it here.
                    </small>
                  )}
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

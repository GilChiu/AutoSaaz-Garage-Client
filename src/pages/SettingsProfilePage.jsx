import React, { useState, useRef, useEffect } from 'react';
import { getGarageProfile, updateGarageProfile, uploadProfileLogo } from '../services/profile.service';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './SettingsProfile.css';

const SettingsProfilePage = () => {
  const [profile, setProfile] = useState({
    garageName: '',
    description: '',
    location: '',
    workingHours: '',
    offDays: ''
  });
  const [logo, setLogo] = useState(null); // Current logo URL
  const [logoFile, setLogoFile] = useState(null); // Selected file for upload
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef(null);

  // Load profile data on component mount
  useEffect(() => {
    console.log('🔵 [SettingsProfilePage] Component mounted, starting loadProfile()');
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('🔵 [loadProfile] Starting profile fetch, setLoading(true)');
      setLoading(true);
      setError('');
      
      console.log('🔵 [loadProfile] Calling getGarageProfile()...');
      const response = await getGarageProfile();
      console.log('✅ [loadProfile] Profile loaded successfully:', response);
      console.log('✅ [loadProfile] Profile loaded successfully:', response);

      if (response.success && response.data?.profile) {
        const profileData = response.data.profile;
        console.log('🔵 [loadProfile] Profile data extracted:', profileData);
        
        const newProfile = {
          garageName: profileData.garageName || '',
          description: profileData.description || '',
          location: profileData.location || '',
          workingHours: profileData.workingHours || '',
          offDays: profileData.offDays || ''
        };
        console.log('🔵 [loadProfile] Setting profile state:', newProfile);
        
        setProfile(newProfile);

        // Set logo preview if available
        if (profileData.logoUrl) {
          console.log('🔵 [loadProfile] Setting logo URL:', profileData.logoUrl);
          setLogo(profileData.logoUrl);
        } else {
          console.log('⚠️ [loadProfile] No logo URL found in profile data');
        }
      } else {
        console.warn('⚠️ [loadProfile] Invalid response structure:', response);
      }
    } catch (err) {
      console.error('❌ [loadProfile] Error loading profile:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      console.log('🔵 [loadProfile] Finally block - setLoading(false)');
      setLoading(false);
      console.log('🔵 [loadProfile] Loading state set to false, scheduling mounted state...');
      // Small delay to ensure DOM updates and CSS applies properly
      setTimeout(() => {
        console.log('✅ [loadProfile] Setting mounted to true (50ms delay complete)');
        setMounted(true);
      }, 50);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
    setSaved(false);
    setError('');
  };

  const handleLogoClick = () => fileInputRef.current?.click();
  
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type before preview
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP).');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 5MB.');
        return;
      }

      // Store file for upload
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = ev => { 
        setLogo(ev.target?.result);
      };
      reader.readAsDataURL(file);
      setSaved(false);
      setError('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    
    try {
      let logoUrl = logo; // Keep existing logo URL
      
      // Upload new logo if file was selected
      if (logoFile) {
        setUploadingLogo(true);
        console.log('Uploading new logo...');
        logoUrl = await uploadProfileLogo(logoFile);
        console.log('Logo uploaded successfully:', logoUrl);
        setUploadingLogo(false);
      }

      // Update profile with all fields
      const updateData = {
        garageName: profile.garageName,
        description: profile.description,
        location: profile.location,
        workingHours: profile.workingHours,
        offDays: profile.offDays,
        logoUrl: logoUrl || null,
      };

      console.log('Updating profile with data:', updateData);

      const response = await updateGarageProfile(updateData);
      
      if (response.success) {
        setSaved(true);
        setLogoFile(null); // Clear selected file
        
        // Update logo with saved URL
        if (response.data?.profile?.logoUrl) {
          setLogo(response.data.profile.logoUrl);
        }
        
        // Update localStorage with new profile data
        if (response.data?.profile) {
          const existingProfile = JSON.parse(localStorage.getItem('profile') || '{}');
          const updatedProfile = {
            ...existingProfile,
            ...response.data.profile
          };
          localStorage.setItem('profile', JSON.stringify(updatedProfile));
          console.log('✅ Profile updated in localStorage:', updatedProfile);
          
          // Trigger storage event for other components (like UpperNavbar) to refresh
          window.dispatchEvent(new Event('storage'));
        }
        
        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
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
      setUploadingLogo(false);
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
              
              {(() => {
                console.log('🎨 [Render] loading:', loading, '| mounted:', mounted);
                return null;
              })()}
              
              {loading ? (
                <div className="profile-form">
                  <div className="profile-avatar-block">
                    <div className="profile-avatar-circle skeleton-loader">
                      <span className="avatar-letter">A</span>
                    </div>
                  </div>
                  <div className="profile-fields">
                    <label className="settings-field full">
                      <span className="settings-label">Business Name</span>
                      <div className="skeleton-input"></div>
                    </label>
                    <label className="settings-field full">
                      <span className="settings-label">Description</span>
                      <div className="skeleton-textarea"></div>
                    </label>
                    <label className="settings-field full">
                      <span className="settings-label">Location</span>
                      <div className="skeleton-input"></div>
                    </label>
                    <div className="profile-two-col">
                      <label className="settings-field">
                        <span className="settings-label">Working Hours</span>
                        <div className="skeleton-input"></div>
                      </label>
                      <label className="settings-field">
                        <span className="settings-label">Off Days / Holidays</span>
                        <div className="skeleton-input"></div>
                      </label>
                    </div>
                  </div>
                  <div className="settings-actions profile-actions">
                    <div className="skeleton-button"></div>
                  </div>
                </div>
              ) : (
                <form 
                  className={`profile-form ${mounted ? 'profile-form-visible' : ''}`} 
                  onSubmit={handleSave}
                  ref={(el) => {
                    if (el) {
                      console.log('📐 [Form Ref] Form element classes:', el.className);
                      console.log('📐 [Form Ref] Form computed display:', window.getComputedStyle(el).display);
                      console.log('📐 [Form Ref] Form computed opacity:', window.getComputedStyle(el).opacity);
                      console.log('📐 [Form Ref] Form computed gap:', window.getComputedStyle(el).gap);
                    }
                  }}
                >
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
                    {logoFile && (
                      <small style={{ color: '#666', fontSize: '12px', marginTop: '8px', display: 'block' }}>
                        Selected: {logoFile.name} ({(logoFile.size / 1024).toFixed(1)} KB)
                      </small>
                    )}
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
                    <button type="submit" className="settings-primary-btn" disabled={saving || uploadingLogo}>
                      {uploadingLogo ? 'Uploading Logo...' : saving ? 'Saving...' : 'Save Details'}
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

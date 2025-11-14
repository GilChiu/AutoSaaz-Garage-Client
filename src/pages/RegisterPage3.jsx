import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { registerStep3 } from '../services/registrationApi';
import { uploadEmiratesId, validateFile, formatFileSize } from '../services/uploadService';
import { validateCompanyName, validateTradeLicense, validateVATCertification, validateEmiratesIdFile } from '../utils/registrationValidation';
import './RegisterPage3.css';
import { autoSaazLogo, heroRegister3 } from '../assets/images';

const RegisterPage3 = () => {
  const [companyName, setCompanyName] = useState('');
  const [emiratesId, setEmiratesId] = useState(null);
  const [tradeLicense, setTradeLicense] = useState('');
  const [vatCert, setVatCert] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const { updateRegistrationData, goToNextStep } = useRegistration();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUploadProgress('');

    // Validate all required fields
    if (!companyName || !tradeLicense || !emiratesId) {
      setError('Please complete all required fields');
      return;
    }

    // Validate company name
    const companyError = validateCompanyName(companyName);
    if (companyError) {
      setError(companyError);
      return;
    }

    // Validate trade license
    const tradeLicenseError = validateTradeLicense(tradeLicense);
    if (tradeLicenseError) {
      setError(tradeLicenseError);
      return;
    }

    // Validate Emirates ID file
    const emiratesIdError = validateEmiratesIdFile(emiratesId);
    if (emiratesIdError) {
      setError(emiratesIdError);
      return;
    }

    // Validate VAT certification if provided
    if (vatCert) {
      const vatError = validateVATCertification(vatCert);
      if (vatError) {
        setError(vatError);
        return;
      }
    }

    // Additional file validation using upload service
    const fileValidation = validateFile(emiratesId);
    if (!fileValidation.ok) {
      setError(fileValidation.error);
      return;
    }

    try {
      setIsUploading(true);
      
      // Get session ID from localStorage for file organization
      const sessionId = localStorage.getItem('registrationSessionId');
      if (!sessionId) {
        setError('Session expired. Please start registration again.');
        setIsUploading(false);
        return;
      }

      // Step 1: Upload Emirates ID file to Supabase Storage
      setUploadProgress('Uploading Emirates ID document...');
      const emiratesIdUrl = await uploadEmiratesId(emiratesId, sessionId);
      
      if (!emiratesIdUrl) {
        setError('Failed to upload Emirates ID. Please try again.');
        setIsUploading(false);
        return;
      }

      // Step 2: Submit business details to backend with uploaded file URL
      setUploadProgress('Saving business details...');
      await registerStep3(companyName, emiratesIdUrl, tradeLicense, vatCert || null);

      // Update context with the data
      updateRegistrationData({
        companyName,
        tradeLicense,
        vatCert,
        emiratesIdUrl,
        emiratesIdName: emiratesId?.name || '',
      });

      setIsUploading(false);
      setUploadProgress('');

      // Success! OTP has been sent, navigate to verification
      goToNextStep();
      navigate('/verify-account');
    } catch (err) {
      setIsUploading(false);
      setUploadProgress('');
      
      // Handle session expired error
      if (err.message.includes('Session expired') || err.message.includes('Session not found')) {
        setError('Your session has expired. Redirecting to start...');
        setTimeout(() => {
          navigate('/register');
        }, 3000);
        return;
      }
      
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="garage-landing-register-page3">
      {/* Header */}
      <div className="landing-header-register-page3">
        <div className="header-logo-register-page3">
          <img
            src={autoSaazLogo}
            alt="AutoSaaz"
            className="header-logo-image-register-page3"
          />
          <div className="header-text-register-page3">
            <span className="company-name-register-page3">AutoSaaz</span>
            <span className="tagline-register-page3">One Stop Auto Shop</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-container-register-page3">
        {/* Left Side - Image */}
        <div className="image-section-register-page3">
          <div className="garage-image-register-page3">
            <img
              src={heroRegister3}
              alt="Mechanic and car parts"
              className="hero-image-register-page3"
            />
          </div>
        </div>

        {/* Right Side - Register Form */}
        <div className="form-section-register-page3">
          <div className="form-content-register-page3">
            <div className="form-header-register-page3">
              <h1>Enter Your Business Details</h1>
            </div>

            {error && <div className="error-message-register-page3">{error}</div>}
            {uploadProgress && <div className="upload-progress-register-page3">{uploadProgress}</div>}

            <form onSubmit={handleSubmit} className="register-form-register-page3">
              <div className="form-group-register-page3">
                <label>Company Legal Name <span className="required-asterisk-register-page3">*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter Company Name"
                  required
                />
              </div>

              <div className="form-group-register-page3">
                <label>Owner/Representative Emirates ID <span className="required-asterisk-register-page3">*</span></label>
                <div className="file-upload-container-register-page3">
                  <input
                    type="file"
                    id="emirates-id-upload"
                    onChange={(e) => setEmiratesId(e.target.files?.[0] || null)}
                    accept="image/*,application/pdf"
                    className="file-input-hidden-register-page3"
                    required
                    disabled={isUploading}
                  />
                  <label htmlFor="emirates-id-upload" className="file-upload-area-register-page3">
                    <span className="upload-text-register-page3">
                      {emiratesId ? `${emiratesId.name} (${formatFileSize(emiratesId.size)})` : "Upload Your Emirates ID"}
                    </span>
                  </label>
                  {emiratesId && (
                    <div className="file-info-register-page3">
                      <small>Accepted formats: JPG, PNG, WEBP, PDF (Max 10MB)</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-register-page3">
                <label>Trade License Number <span className="required-asterisk-register-page3">*</span></label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  placeholder="Enter Trade License Number"
                  required
                />
              </div>

              <div className="form-group-register-page3">
                <label>VAT Certification (Optional)</label>
                <input
                  type="text"
                  value={vatCert}
                  onChange={(e) => setVatCert(e.target.value)}
                  placeholder="Enter VAT Certification"
                />
              </div>

              <button type="submit" className="next-btn-register-page3" disabled={isUploading}>
                {isUploading ? 'Processing...' : 'Next'}
              </button>
            </form>

            {/* Login Link */}
            <div className="login-link-register-page3">
              <span>Already have an account? </span>
              <Link to="/login" className="login-now-register-page3">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage3;

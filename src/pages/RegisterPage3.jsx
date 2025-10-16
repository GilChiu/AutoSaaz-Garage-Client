import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import './RegisterPage3.css';
import { autoSaazLogo, heroRegister3 } from '../assets/images';
import {
    validateCompanyName,
    validateTradeLicense,
    validateVatCertification,
} from '../utils/validation';

const RegisterPage3 = () => {
  const [companyName, setCompanyName] = useState('');
  const [emiratesId, setEmiratesId] = useState(null);
  const [tradeLicense, setTradeLicense] = useState('');
  const [vatCert, setVatCert] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registrationData, updateRegistrationData } = useRegistration();
  const { registerStep3 } = useAuth();
  const navigate = useNavigate();

  // Redirect if no userId from previous steps
  useEffect(() => {
    if (!registrationData.userId) {
      navigate('/register');
    }
  }, [registrationData.userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate company name
    const companyValidation = validateCompanyName(companyName);
    if (!companyValidation.isValid) {
      setError(companyValidation.error);
      return;
    }

    // Validate trade license
    const licenseValidation = validateTradeLicense(tradeLicense);
    if (!licenseValidation.isValid) {
      setError(licenseValidation.error);
      return;
    }

    // Validate VAT certification (optional)
    const vatValidation = validateVatCertification(vatCert);
    if (!vatValidation.isValid) {
      setError(vatValidation.error);
      return;
    }

    // Check Emirates ID file
    if (!emiratesId) {
      setError('Please upload your Emirates ID');
      return;
    }

    try {
      setLoading(true);

      // TODO: Upload Emirates ID file to server first (implement file upload API)
      // For now, we'll use a placeholder URL
      const emiratesIdUrl = emiratesId.name; // Replace with actual upload URL

      // Call API for registration step 3
      const response = await registerStep3({
        userId: registrationData.userId,
        companyLegalName: companyName.trim(),
        emiratesIdUrl: emiratesIdUrl,
        tradeLicenseNumber: tradeLicense.trim().toUpperCase(),
        vatCertification: vatCert.trim().toUpperCase() || undefined,
      });

      if (response.success) {
        // Save to registration context
        updateRegistrationData({
          companyLegalName: companyName.trim(),
          emiratesIdUrl: emiratesIdUrl,
          tradeLicenseNumber: tradeLicense.trim().toUpperCase(),
          vatCertification: vatCert.trim().toUpperCase(),
        });

        // Navigate to login since registration is complete
        // Note: Backend may require verification, adjust flow as needed
        navigate('/login');
      }
    } catch (err) {
      console.error('Registration Step 3 error:', err);
      setError(
        err.message ||
          'Failed to save business details. Please try again.'
      );
    } finally {
      setLoading(false);
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

            <form onSubmit={handleSubmit} className="register-form-register-page3">
              <div className="form-group-register-page3">
                <label>Company Legal Name <span className="required-asterisk-register-page3">*</span></label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter Company Name"
                  disabled={loading}
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
                    disabled={loading}
                    required
                  />
                  <label htmlFor="emirates-id-upload" className="file-upload-area-register-page3">
                    <span className="upload-text-register-page3">
                      {emiratesId ? emiratesId.name : "Upload Your Emirates ID"}
                    </span>
                  </label>
                </div>
              </div>

              <div className="form-group-register-page3">
                <label>Trade License Number <span className="required-asterisk-register-page3">*</span></label>
                <input
                  type="text"
                  value={tradeLicense}
                  onChange={(e) => setTradeLicense(e.target.value)}
                  placeholder="Enter Trade License Number"
                  disabled={loading}
                  required
                />
              </div>

              <div className="form-group-register-page3">
                <label>VAT Certification (Optional)</label>
                <input
                  type="text"
                  value={vatCert}
                  onChange={(e) => setVatCert(e.target.value)}
                  placeholder="Enter VAT Certification (Optional)"
                  disabled={loading}
                />
              </div>

              <button type="submit" className="next-btn-register-page3" disabled={loading}>
                {loading ? 'Submitting...' : 'Complete Registration'}
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

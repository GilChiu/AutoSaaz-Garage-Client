import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import './RegisterPage3.css';

const RegisterPage3 = () => {
  const [companyName, setCompanyName] = useState('');
  const [emiratesId, setEmiratesId] = useState(null);
  const [tradeLicense, setTradeLicense] = useState('');
  const [vatCert, setVatCert] = useState('');
  const [error, setError] = useState('');
  const { updateRegistrationData, goToNextStep } = useRegistration();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!companyName || !tradeLicense || !emiratesId) {
      setError('Please complete all required fields');
      return;
    }

    try {
      updateRegistrationData({
        companyName,
        tradeLicense,
        vatCert,
        emiratesIdName: emiratesId?.name || '',
      });
      goToNextStep();
      navigate('/verify-account');
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="garage-landing-register-page3">
      {/* Header */}
      <div className="landing-header-register-page3">
        <div className="header-logo-register-page3">
          <img
            src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
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
              src={`${process.env.PUBLIC_URL}/hero-register3.png`}
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
                  required
                />
              </div>

              <div className="form-group-register-page3">
                <label>Owner/Representative Emirates ID <span className="required-asterisk-register-page3">*</span></label>
                <input
                  type="file"
                  onChange={(e) => setEmiratesId(e.target.files?.[0] || null)}
                  accept="image/*,application/pdf"
                  placeholder="Upload Your Emirates ID"
                  required
                />
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

              <button type="submit" className="next-btn-register-page3">Next</button>
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

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import './RegisterPage.css';
import { autoSaazLogo, heroRegister } from '../assets/images';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const { updateRegistrationData, goToNextStep } = useRegistration();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate required fields
        if (!fullName || !email || !phoneNumber) {
            setError('All fields are required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            // Derive first and last name from fullName (best-effort)
            const nameParts = fullName.trim().split(/\s+/);
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

            // Save data to registration context
            updateRegistrationData({
                firstName,
                lastName,
                email,
                phone: phoneNumber
            });

            // Go to next step (business location)
            goToNextStep();
            navigate('/register-step-2');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="garage-landing-register-page">
            {/* Header */}
            <div className="landing-header-register-page">
                <div className="header-logo-register-page">
                    <img 
                        src={autoSaazLogo}
                        alt="AutoSaaz" 
                        className="header-logo-image-register-page"
                    />
                    <div className="header-text-register-page">
                        <span className="company-name-register-page">AutoSaaz</span>
                        <span className="tagline-register-page">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-container-register-page">
                {/* Left Side - Image */}
                <div className="image-section-register-page">
                    <div className="garage-image-register-page">
                        <img 
                            src={heroRegister}
                            alt="Auto mechanics working" 
                            className="hero-image-register-page"
                        />
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="form-section-register-page">
                    <div className="form-content-register-page">
                        <div className="form-header-register-page">
                            <h1>Welcome to Auto Saaz!</h1>
                        </div>

                        {error && <div className="error-message-register-page">{error}</div>}

                        <form onSubmit={handleSubmit} className="register-form-register-page">
                            <div className="form-group-register-page">
                                <label className='fullname-label-register-page'>Full Name <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter Full Name"
                                    required
                                />
                            </div>

                            <div className="form-group-register-page">
                                <label>Email <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter Email"
                                    required
                                />
                            </div>

                            <div className="form-group-register-page">
                                <label>Phone Number <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Enter Phone Number"
                                    required
                                />
                            </div>

                            <button type="submit" className="next-btn-register-page">
                                Next
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="login-link-register-page">
                            <span>Already have an account? </span>
                            <Link to="/login" className="login-now-register-page">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
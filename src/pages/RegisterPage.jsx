import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import './RegisterPage.css';
import { autoSaazLogo, heroRegister } from '../assets/images';
import {
    validateFullName,
    validateEmail,
    validatePhoneNumber,
    validatePassword,
    formatPhoneNumber,
} from '../utils/validation';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { updateRegistrationData } = useRegistration();
    const { registerStep1 } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate full name
        const nameValidation = validateFullName(fullName);
        if (!nameValidation.isValid) {
            setError(nameValidation.error);
            return;
        }

        // Validate email
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            setError(emailValidation.error);
            return;
        }

        // Format and validate phone number
        const formattedPhone = formatPhoneNumber(phoneNumber);
        const phoneValidation = validatePhoneNumber(formattedPhone);
        if (!phoneValidation.isValid) {
            setError(phoneValidation.error);
            return;
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setError(passwordValidation.error);
            return;
        }

        try {
            setLoading(true);

            // Call API for registration step 1
            const response = await registerStep1({
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                phoneNumber: formattedPhone,
                password: password,
            });

            if (response.success && response.data) {
                // Save registration data to context
                updateRegistrationData({
                    userId: response.data.userId,
                    fullName: fullName.trim(),
                    email: response.data.email,
                    phoneNumber: response.data.phoneNumber,
                    password: password, // Store temporarily for the session
                    requiresVerification: response.data.requiresVerification,
                    currentStep: response.data.requiresVerification ? 0 : 2, // 0 for verification, 2 for step 2
                });

                // Navigate to verification or next step
                if (response.data.requiresVerification) {
                    navigate('/verify-account');
                } else {
                    navigate('/register-step-2');
                }
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(
                err.message ||
                    'Registration failed. Please check your information and try again.'
            );
        } finally {
            setLoading(false);
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
                                    disabled={loading}
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
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group-register-page">
                                <label>Phone Number <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="+971501234567"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group-register-page">
                                <label>Password <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password (min 8 characters)"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <button type="submit" className="next-btn-register-page" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Next'}
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
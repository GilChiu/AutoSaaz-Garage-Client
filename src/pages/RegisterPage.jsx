import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import './RegisterPage.css';

const RegisterPage = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const { updateRegistrationData, goToNextStep } = useRegistration();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields are filled
        if (!firstName || !lastName || !email || !password || !phoneNumber) {
            setError('All fields are required');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            // Save data to registration context
            updateRegistrationData({
                firstName,
                lastName,
                email,
                password,
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
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
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
                            src={`${process.env.PUBLIC_URL}/hero-register.png`}
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
                                <label className='firstname-label-register-page'>First Name <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter First Name"
                                    required
                                />
                            </div>

                            <div className="form-group-register-page">
                                <label className='lastname-label-register-page'>Last Name <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter Last Name"
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
                                <label>Password <span className="required-asterisk-register-page">*</span></label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
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
                                Register
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
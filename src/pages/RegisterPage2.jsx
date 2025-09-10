import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import './RegisterPage2.css';

const RegisterPage2 = () => {
    const [address, setAddress] = useState('');
    const [street, setStreet] = useState('');
    const [state, setState] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const { updateRegistrationData, goToNextStep } = useRegistration();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields are filled
        if (!address || !street || !state || !location) {
            setError('All fields are required');
            return;
        }

        try {
            // Save business location data to registration context
            updateRegistrationData({
                address,
                street,
                state,
                location
            });

            // Go to next step (verification)
            goToNextStep();
            navigate('/verify-account');
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="garage-landing-register-page2">
            {/* Header */}
            <div className="landing-header-register-page2">
                <div className="header-logo-register-page2">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="header-logo-image-register-page2"
                    />
                    <div className="header-text-register-page2">
                        <span className="company-name-register-page2">AutoSaaz</span>
                        <span className="tagline-register-page2">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-container-register-page2">
                {/* Left Side - Image */}
                <div className="image-section-register-page2">
                    <div className="garage-image-register-page2">
                        <img 
                            src={`${process.env.PUBLIC_URL}/hero-register2.png`}
                            alt="Auto mechanic with tools" 
                            className="hero-image-register-page2"
                        />
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="form-section-register-page2">
                    <div className="form-content-register-page2">
                        <div className="form-header-register-page2">
                            <h1>Enter Your Business Location</h1>
                        </div>

                        {error && <div className="error-message-register-page2">{error}</div>}

                        <form onSubmit={handleSubmit} className="register-form-register-page2">
                            <div className="form-group-register-page2">
                                <label className='address-label-register-page2'>Address <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Enter Shop Name, Building Name"
                                    required
                                />
                            </div>

                            <div className="form-group-register-page2">
                                <label>Street <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={street}
                                    onChange={(e) => setStreet(e.target.value)}
                                    placeholder="Enter Street"
                                    required
                                />
                            </div>

                            <div className="form-group-register-page2">
                                <label>State <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Enter State"
                                    required
                                />
                            </div>

                            <div className="form-group-register-page2">
                                <label>Location <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter Location"
                                    required
                                />
                            </div>

                            <button type="submit" className="next-btn-register-page2">
                                Next
                            </button>
                        </form>

                        {/* Login Link */}
                        <div className="login-link-register-page2">
                            <span>Already have an account? </span>
                            <Link to="/login" className="login-now-register-page2">Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage2;

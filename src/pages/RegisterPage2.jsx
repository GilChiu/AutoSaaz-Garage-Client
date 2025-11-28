import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { registerStep2 } from '../services/registrationApi';
import { validateAddress, validateStreet, validateState, validateLocation } from '../utils/registrationValidation';
import './RegisterPage2.css';
import { autoSaazLogo, heroRegister2 } from '../assets/images';

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

        // Client-side validation
        const addressError = validateAddress(address);
        if (addressError) {
            setError(addressError);
            return;
        }

        const streetError = validateStreet(street);
        if (streetError) {
            setError(streetError);
            return;
        }

        const stateError = validateState(state);
        if (stateError) {
            setError(stateError);
            return;
        }

        const locationError = validateLocation(location);
        if (locationError) {
            setError(locationError);
            return;
        }

        try {
            // Call Step 2 API with sessionId
            const response = await registerStep2(address, street, state, location);

            if (response.success) {
                // Save business location data to registration context
                updateRegistrationData({
                    address,
                    street,
                    state,
                    location
                });

                // Go to next step (step 3 - business details)
                goToNextStep();
                navigate('/register-step-3');
            }
        } catch (err) {
            // Handle specific error messages
            if (err.message.includes('Session expired') || err.message.includes('complete Step 1')) {
                setError('Session expired. Please start registration again.');
                // Optionally redirect to step 1
                setTimeout(() => navigate('/register'), 3000);
            } else {
                setError(err.message || 'Failed to save business location. Please try again.');
            }
        }
    };

    return (
        <div className="garage-landing-register-page2">
            {/* Header */}
            <div className="landing-header-register-page2">
                <div className="header-logo-register-page2">
                    <img 
                        src={autoSaazLogo}
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
                            src={heroRegister2}
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
                                <select
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    required
                                    className="state-select-register-page2"
                                >
                                    <option value="" disabled>Select State</option>
                                    <option value="Abu Dhabi">Abu Dhabi</option>
                                    <option value="Dubai">Dubai</option>
                                    <option value="Sharjah">Sharjah</option>
                                    <option value="Ajman">Ajman</option>
                                    <option value="Umm Al Quwain">Umm Al Quwain</option>
                                    <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                                    <option value="Fujairah">Fujairah</option>
                                </select>
                            </div>

                            <div className="form-group-register-page2">
                                <label>Nearest Landmark <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter Nearest Landmark"
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

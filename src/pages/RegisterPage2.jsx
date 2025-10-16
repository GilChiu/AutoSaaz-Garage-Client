import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import './RegisterPage2.css';
import { autoSaazLogo, heroRegister2 } from '../assets/images';
import {
    validateAddress,
    validateStreet,
    validateState,
    validateLocation,
} from '../utils/validation';

const RegisterPage2 = () => {
    const [address, setAddress] = useState('');
    const [street, setStreet] = useState('');
    const [state, setState] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { registrationData, updateRegistrationData, goToNextStep } = useRegistration();
    const { registerStep2 } = useAuth();
    const navigate = useNavigate();

    // Redirect if no userId from step 1
    useEffect(() => {
        if (!registrationData.userId) {
            navigate('/register');
        }
    }, [registrationData.userId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate address
        const addressValidation = validateAddress(address);
        if (!addressValidation.isValid) {
            setError(addressValidation.error);
            return;
        }

        // Validate street
        const streetValidation = validateStreet(street);
        if (!streetValidation.isValid) {
            setError(streetValidation.error);
            return;
        }

        // Validate state
        const stateValidation = validateState(state);
        if (!stateValidation.isValid) {
            setError(stateValidation.error);
            return;
        }

        // Validate location
        const locationValidation = validateLocation(location);
        if (!locationValidation.isValid) {
            setError(locationValidation.error);
            return;
        }

        try {
            setLoading(true);

            // Call API for registration step 2
            const response = await registerStep2({
                userId: registrationData.userId,
                address: address.trim(),
                street: street.trim(),
                state: state.trim(),
                location: location.trim(),
            });

            if (response.success) {
                // Save to registration context
                updateRegistrationData({
                    address: address.trim(),
                    street: street.trim(),
                    state: state.trim(),
                    location: location.trim(),
                });

                // Go to next step
                goToNextStep();
                navigate('/register-step-3');
            }
        } catch (err) {
            console.error('Registration Step 2 error:', err);
            setError(
                err.message ||
                    'Failed to save business location. Please try again.'
            );
        } finally {
            setLoading(false);
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
                                    disabled={loading}
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
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group-register-page2">
                                <label>State/Emirate <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    placeholder="Enter State/Emirate (e.g., Dubai)"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <div className="form-group-register-page2">
                                <label>Location <span className="required-asterisk-register-page2">*</span></label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Enter Location/Area"
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <button type="submit" className="next-btn-register-page2" disabled={loading}>
                                {loading ? 'Saving...' : 'Next'}
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

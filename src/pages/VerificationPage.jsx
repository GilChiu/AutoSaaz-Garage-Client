import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './VerificationPage.css';

const VerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [sentCode, setSentCode] = useState('');
    const { registrationData, resetRegistration } = useRegistration();
    const { register } = useAuth();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Send verification code when component mounts
    useEffect(() => {
        const sendCode = async () => {
            try {
                const response = await axios.post('http://localhost:5000/api/auth/send-verification', {
                    email: registrationData.email
                });
                setSentCode(response.data.verificationCode); // For demo purposes
            } catch (err) {
                setError('Failed to send verification code');
            }
        };

        if (registrationData.email) {
            sendCode();
        }
    }, [registrationData.email]);

    const handleInputChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return;

        const newCode = [...verificationCode];
        newCode[index] = value;
        setVerificationCode(newCode);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace to move to previous input
        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('');
        
        const newCode = [...verificationCode];
        digits.forEach((digit, index) => {
            if (index < 6) {
                newCode[index] = digit;
            }
        });
        setVerificationCode(newCode);

        // Focus the next empty input or the last input
        const nextEmptyIndex = newCode.findIndex(code => code === '');
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const codeString = verificationCode.join('');
        if (!codeString || codeString.length !== 6) {
            setError('Please enter a valid 6-digit verification code');
            setLoading(false);
            return;
        }

        try {
            // Create the user account with all the registration data
            await register({
                firstName: registrationData.firstName,
                lastName: registrationData.lastName,
                email: registrationData.email,
                password: registrationData.password,
                phone: registrationData.phone,
                address: registrationData.address,
                street: registrationData.street,
                state: registrationData.state,
                location: registrationData.location,
                verificationCode: codeString
            });

            // Clear registration data
            resetRegistration();
            
            // Navigate to dashboard
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/send-verification', {
                email: registrationData.email
            });
            setSentCode(response.data.verificationCode);
            alert(`New verification code: ${response.data.verificationCode}`);
        } catch (err) {
            setError('Failed to resend code');
        }
    };

    return (
        <div className="garage-landing-verification-page">
            {/* Header */}
            <div className="landing-header-verification-page">
                <div className="header-logo-verification-page">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="header-logo-image-verification-page"
                    />
                    <div className="header-text-verification-page">
                        <span className="company-name-verification-page">AutoSaaz</span>
                        <span className="tagline-verification-page">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-container-verification-page">
                {/* Centered Verification Form - No Image */}
                <div className="form-section-verification-page">
                    <div className="form-content-verification-page">
                        <div className="form-header-verification-page">
                            <h1>Enter Verification Code</h1>
                            <p>We've sent a 6-digit code to your email or phone number.</p>
                            {sentCode && (
                                <div className="demo-code-verification-page">
                                    <strong>Demo Code: {sentCode}</strong>
                                </div>
                            )}
                        </div>

                        {error && <div className="error-message-verification-page">{error}</div>}

                        <form onSubmit={handleSubmit} className="verification-form-verification-page">
                            <div className="form-group-verification-page">
                                <label>Enter Verification Code</label>
                                <p className="verification-subtitle">We've sent a 6-digit code to your email or phone number.</p>
                                
                                <div className="verification-inputs-container">
                                    {verificationCode.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            type="text"
                                            value={digit}
                                            onChange={(e) => handleInputChange(index, e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(index, e)}
                                            onPaste={handlePaste}
                                            className="verification-digit-input"
                                            maxLength="1"
                                            inputMode="numeric"
                                            autoComplete="off"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="resend-section-verification-page">
                                <span>Didn't get the code? </span>
                                <button 
                                    type="button" 
                                    className="resend-btn-verification-page"
                                    onClick={handleResendCode}
                                >
                                    Resend Code
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                className="verify-btn-verification-page"
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>

                            <button 
                                type="button" 
                                className="back-btn-verification-page"
                                onClick={() => navigate('/register')}
                            >
                                ← Back
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;

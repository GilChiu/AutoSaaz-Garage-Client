import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import { autoSaazLogo } from '../assets/images';
import './VerificationPage.css';
import { validateOtpCode } from '../utils/validation';

const VerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { registrationData, resetRegistration } = useRegistration();
    const { verifyAccount, resendVerification } = useAuth();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Redirect if no email/phone from registration
    useEffect(() => {
        if (!registrationData.email && !registrationData.phoneNumber) {
            navigate('/register');
        }
    }, [registrationData, navigate]);

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
        setSuccess('');

        const codeString = verificationCode.join('');
        
        // Validate OTP code
        const validation = validateOtpCode(codeString);
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        try {
            setLoading(true);

            // Call API to verify account
            const response = await verifyAccount({
                code: codeString,
                email: registrationData.email,
                phoneNumber: registrationData.phoneNumber,
            });

            if (response.success) {
                setSuccess('Verification successful! Proceeding to next step...');
                
                // Clear registration data and navigate
                setTimeout(() => {
                    resetRegistration();
                    navigate('/register-step-2');
                }, 1500);
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(
                err.message ||
                    'Verification failed. Please check your code and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setError('');
        setSuccess('');

        try {
            const response = await resendVerification({
                email: registrationData.email,
                phoneNumber: registrationData.phoneNumber,
            });

            if (response.success) {
                setSuccess(response.message || 'Verification code resent successfully!');
            }
        } catch (err) {
            console.error('Resend code error:', err);
            setError(err.message || 'Failed to resend code. Please try again.');
        }
    };

    return (
        <div className="garage-landing-verification-page">
            {/* Header */}
            <div className="landing-header-verification-page">
                <div className="header-logo-verification-page">
                    <img 
                        src={autoSaazLogo}
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
                            <p>We've sent a 6-digit code to {registrationData.email || registrationData.phoneNumber}</p>
                        </div>

                        {error && <div className="error-message-verification-page">{error}</div>}
                        {success && <div className="success-message-verification-page">{success}</div>}

                        <form onSubmit={handleSubmit} className="verification-form-verification-page">
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
                                onClick={() => navigate('/register-step-3')}
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

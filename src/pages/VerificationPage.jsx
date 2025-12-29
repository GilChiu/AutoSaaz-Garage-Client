import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { useAuth } from '../context/AuthContext';
import { verifyRegistration, resendOTP } from '../services/registrationApi';
import { validateOTP } from '../utils/registrationValidation';
import './VerificationPage.css';

const VerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const { resetRegistration, registrationData } = useRegistration();
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();
    const inputRefs = useRef([]);

    // Front-end only: generate a mock verification code on mount
    useEffect(() => {
        // In mock mode, we could still show an alert to simulate code sent
        // alert('A verification code has been sent (mock).');
    }, []);

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

        // Validate OTP (must be 6 digits)
        const otpError = validateOTP(codeString);
        if (otpError) {
            setError(otpError);
            setLoading(false);
            return;
        }

        if (!registrationData.password) {
            setError('Password missing. Please restart registration and set your password on Step 1.');
            setLoading(false);
            return;
        }

        try {



            // Call the real backend verification API
            const response = await verifyRegistration(codeString, registrationData.password);

            if (response && response.success) {

                // The backend returns: response.data.data.user and response.data.data.accessToken
                const userData = response.data?.user;
                const accessToken = response.data?.accessToken;
                
                if (userData && accessToken) {

                    // Use AuthContext's loginWithToken method for proper auto-login
                    loginWithToken(accessToken, userData);
                    
                    // Clear registration context
                    resetRegistration();

                    navigate('/dashboard');
                } else {
                    throw new Error('Invalid response data from verification - missing user or token');
                }
            } else {
                throw new Error(response?.message || 'Verification failed');
            }
        } catch (err) {

            // Get the error message from the response
            const errorMessage = err.response?.data?.message || err.message || 'Verification failed';

            // Handle specific backend errors with precise matching
            if (errorMessage.includes('Invalid or expired session')) {
                // Only this specific message triggers session expiration
                setError('Registration session expired. Please start the registration process again.');
                localStorage.removeItem('registrationSessionId');
                localStorage.removeItem('sessionExpiresAt');
                setTimeout(() => navigate('/register'), 3000);
            } else if (errorMessage.includes('Invalid or expired verification code')) {
                // Wrong code entered
                setError('Invalid verification code. Please check and try again.');
            } else if (errorMessage.includes('Too many verification attempts')) {
                // Rate limit reached
                setError('Too many attempts. Please request a new verification code.');
            } else if (errorMessage.includes('Session ID and verification code are required')) {
                // Missing data - likely session expired
                setError('Session expired. Please register again.');
                localStorage.removeItem('registrationSessionId');
                localStorage.removeItem('sessionExpiresAt');
                setTimeout(() => navigate('/register'), 3000);
            } else {
                // Generic error
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        setResendLoading(true);
        setResendSuccess(false);
        setError('');

        try {


            const response = await resendOTP();
            
            if (response && response.success) {

                setResendSuccess(true);
                setTimeout(() => {
                    setResendSuccess(false);
                }, 5000);
            } else {
                throw new Error(response?.message || 'Failed to resend code');
            }
        } catch (err) {

            // Get the error message from the response
            const errorMessage = err.response?.data?.message || err.message || 'Failed to resend code';

            // Only redirect if truly a session expiration error
            if (errorMessage.includes('Invalid or expired session') || 
                errorMessage.includes('Session ID') || 
                errorMessage.includes('session expired')) {
                setError('Registration session expired. Please start over.');
                localStorage.removeItem('registrationSessionId');
                localStorage.removeItem('sessionExpiresAt');
                setTimeout(() => navigate('/register'), 3000);
            } else {
                setError(errorMessage);
            }
        } finally {
            setResendLoading(false);
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
                        </div>

                        {error && <div className="error-message-verification-page">{error}</div>}

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
                                    disabled={resendLoading}
                                >
                                    {resendLoading ? 'Sending...' : 'Resend Code'}
                                </button>
                                {resendSuccess && (
                                    <span style={{ color: '#16a34a', marginLeft: '8px', fontSize: '14px' }}>
                                        ✓ Code sent!
                                    </span>
                                )}
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

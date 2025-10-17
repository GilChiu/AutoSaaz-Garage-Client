import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistration } from '../context/RegistrationContext';
import { verifyRegistration, resendOTP } from '../services/registrationApi';
import { validateOTP } from '../utils/registrationValidation';
import './VerificationPage.css';

const VerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const { resetRegistration } = useRegistration();
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

        try {
            console.log('=== REAL VERIFICATION MODE ===');
            console.log('OTP Code entered:', codeString);
            console.log('Calling real backend verification endpoint...');

            // Call the real backend verification API
            const response = await verifyRegistration(codeString);

            if (response && response.success) {
                console.log('✅ Real verification successful:', response);
                
                // The registrationApi already saved the tokens and user data
                // Now update the auth context with the user
                const userData = response.data.user;
                const accessToken = response.data.accessToken;
                
                if (userData && accessToken) {
                    // Set the token in localStorage for AuthContext to pick up
                    localStorage.setItem('token', accessToken);
                    
                    console.log('✅ User authenticated:', userData);
                    console.log('✅ Token saved, auth context will auto-login');
                    
                    // Clear registration context
                    resetRegistration();
                    
                    console.log('✅ Navigating to dashboard...');
                    navigate('/dashboard');
                } else {
                    throw new Error('Invalid response data from verification');
                }
            } else {
                throw new Error(response?.message || 'Verification failed');
            }
        } catch (err) {
            console.error('Verification error:', err);
            
            // Handle specific backend errors
            if (err.message.includes('expired') || err.message.includes('Session')) {
                setError('Registration session expired. Please start the registration process again.');
                // Clear any stale session data
                localStorage.removeItem('registrationSessionId');
                localStorage.removeItem('sessionExpiresAt');
                setTimeout(() => navigate('/register'), 2000);
            } else if (err.message.includes('Invalid') || err.message.includes('code')) {
                setError('Invalid verification code. Please try again.');
            } else if (err.message.includes('attempts') || err.message.includes('Maximum')) {
                setError('Too many verification attempts. Please request a new code.');
            } else {
                setError(err.message || 'Verification failed. Please try again.');
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
            console.log('=== RESENDING OTP VIA REAL API ===');
            console.log('Calling backend resend endpoint...');
            
            const response = await resendOTP();
            
            if (response && response.success) {
                console.log('✅ OTP resent successfully via backend');
                setResendSuccess(true);
                setTimeout(() => {
                    setResendSuccess(false);
                }, 5000);
            } else {
                throw new Error(response?.message || 'Failed to resend code');
            }
        } catch (err) {
            console.error('Resend OTP error:', err);
            
            if (err.message.includes('expired') || err.message.includes('Session')) {
                setError('Registration session expired. Please start the registration process again.');
                localStorage.removeItem('registrationSessionId');
                localStorage.removeItem('sessionExpiresAt');
                setTimeout(() => navigate('/register'), 2000);
            } else {
                setError(err.message || 'Failed to resend code. Please try again.');
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

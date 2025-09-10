import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ResetVerificationPage.css';

const ResetVerificationPage = () => {
    const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const inputRefs = useRef([]);
    const email = location.state?.email || '';

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
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
        const paste = e.clipboardData.getData('text');
        const pasteCode = paste.replace(/\D/g, '').slice(0, 6);
        
        if (pasteCode.length === 6) {
            setVerificationCode(pasteCode.split(''));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = verificationCode.join('');
        
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // TODO: Implement API call to verify reset code
            console.log('Verifying reset code:', code, 'for email:', email);
            navigate('/reset-password', { state: { email, verificationCode: code } });
        } catch (err) {
            console.error('Verification error:', err);
            setError('Invalid verification code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            // TODO: Implement resend reset code API call
            console.log('Resending reset code to:', email);
            // Show success message or notification
        } catch (err) {
            console.error('Resend error:', err);
            setError('Failed to resend code. Please try again.');
        }
    };

    return (
        <div className="reset-verification-container">
            <div className="reset-verification-header">
                <div className="reset-verification-logo">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="reset-verification-logo-image"
                    />
                    <div className="reset-verification-header-text">
                        <span className="reset-verification-company-name">AutoSaaz</span>
                        <span className="reset-verification-tagline">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            <div className="reset-verification-main">
                <div className="reset-verification-form-container">
                    <div className="reset-verification-form-content">
                        <h1 className="reset-verification-title">Enter Verification Code</h1>
                        <p className="reset-verification-subtitle">
                            We've sent a 6-digit code to your email or phone number.
                        </p>

                        {error && <div className="reset-verification-error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="reset-verification-form">
                            <div className="reset-verification-code-inputs">
                                {verificationCode.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="reset-verification-code-input"
                                    />
                                ))}
                            </div>

                            <div className="reset-verification-resend">
                                <span>Didn't get the code? </span>
                                <button 
                                    type="button" 
                                    onClick={handleResendCode}
                                    className="reset-verification-resend-btn"
                                >
                                    Resend Code
                                </button>
                            </div>

                            <button 
                                type="submit" 
                                className="reset-verification-submit-btn" 
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </form>

                        <div className="reset-verification-back-link">
                            <Link to="/forgot-password" className="reset-verification-back-btn">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetVerificationPage;

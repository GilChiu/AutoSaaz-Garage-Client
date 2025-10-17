import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/auth.service';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email) {
            setError('Please enter your email address');
            setLoading(false);
            return;
        }

        try {
            const response = await forgotPassword(email);
            
            if (response.success) {
                // Navigate to verification page
                navigate('/reset-verification', { state: { email } });
            } else {
                setError(response.message || 'Failed to send reset code. Please try again.');
            }
        } catch (err) {
            console.error('Send reset code error:', err);
            
            // Always show a generic success message for security (prevent email enumeration)
            // But navigate to verification page anyway
            navigate('/reset-verification', { state: { email } });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-header">
                <div className="forgot-password-logo">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="forgot-password-logo-image"
                    />
                    <div className="forgot-password-header-text">
                        <span className="forgot-password-company-name">AutoSaaz</span>
                        <span className="forgot-password-tagline">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            <div className="forgot-password-main">
                <div className="forgot-password-form-container">
                    <div className="forgot-password-form-content">
                        <h1 className="forgot-password-title">Reset via Email</h1>
                        <p className="forgot-password-subtitle">Enter your email to receive the verification code.</p>

                        {error && <div className="forgot-password-error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            <div className="forgot-password-form-group">
                                <label className="forgot-password-label">Enter Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter Your Email Address"
                                    className="forgot-password-input"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="forgot-password-submit-btn" 
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>

                        <div className="forgot-password-back-link">
                            <Link to="/login" className="forgot-password-back-btn">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;

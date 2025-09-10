import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './CreateNewPasswordPage.css';

const CreateNewPasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const verificationCode = location.state?.verificationCode || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            // TODO: Implement API call to reset password
            console.log('Resetting password for:', email, 'with code:', verificationCode);
            navigate('/password-reset-success');
        } catch (err) {
            console.error('Password reset error:', err);
            setError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-new-password-container">
            <div className="create-new-password-header">
                <div className="create-new-password-logo">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="create-new-password-logo-image"
                    />
                    <div className="create-new-password-header-text">
                        <span className="create-new-password-company-name">AutoSaaz</span>
                        <span className="create-new-password-tagline">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            <div className="create-new-password-main">
                <div className="create-new-password-form-container">
                    <div className="create-new-password-form-content">
                        <h1 className="create-new-password-title">Create New Password</h1>
                        <p className="create-new-password-subtitle">Set a strong password you can remember.</p>

                        {error && <div className="create-new-password-error-message">{error}</div>}

                        <form onSubmit={handleSubmit} className="create-new-password-form">
                            <div className="create-new-password-form-group">
                                <label className="create-new-password-label">New Password</label>
                                <div className="create-new-password-input-container">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter New Password"
                                        className="create-new-password-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="create-new-password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                    >
                                        {showNewPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"/>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5-1.17"/>
                                                <line x1="2" y1="2" x2="22" y2="22"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="create-new-password-form-group">
                                <label className="create-new-password-label">Confirm Password</label>
                                <div className="create-new-password-input-container">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-Enter New Password"
                                        className="create-new-password-input"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="create-new-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        {showConfirmPassword ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"/>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5-1.17"/>
                                                <line x1="2" y1="2" x2="22" y2="22"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="create-new-password-submit-btn" 
                                disabled={loading}
                            >
                                {loading ? 'Confirming...' : 'Confirm Password'}
                            </button>
                        </form>

                        <div className="create-new-password-back-link">
                            <Link to="/reset-verification" className="create-new-password-back-btn">
                                ← Back
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateNewPasswordPage;

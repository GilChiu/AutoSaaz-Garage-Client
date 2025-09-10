import React from 'react';
import { Link } from 'react-router-dom';
import './PasswordResetSuccessPage.css';

const PasswordResetSuccessPage = () => {
    return (
        <div className="password-reset-success-container">
            <div className="password-reset-success-header">
                <div className="password-reset-success-logo">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="password-reset-success-logo-image"
                    />
                    <div className="password-reset-success-header-text">
                        <span className="password-reset-success-company-name">AutoSaaz</span>
                        <span className="password-reset-success-tagline">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            <div className="password-reset-success-main">
                <div className="password-reset-success-content-container">
                    <div className="password-reset-success-content">
                        <div className="password-reset-success-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22,4 12,14.01 9,11.01"/>
                            </svg>
                        </div>
                        
                        <h1 className="password-reset-success-title">Password Successfully Reset</h1>
                        <p className="password-reset-success-subtitle">
                            Your password has been updated! You can now log in securely using your new password.
                        </p>

                        <Link to="/login" className="password-reset-success-login-btn">
                            Back To Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetSuccessPage;

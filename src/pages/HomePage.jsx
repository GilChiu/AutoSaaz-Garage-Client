import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
    return (
        <div className="garage-landing-home-page">
            {/* Header */}
            <div className="landing-header-home-page">
                <div className="header-logo-home-page">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="header-logo-image-home-page"
                    />
                    <div className="header-text-home-page">
                        <span className="company-name-home-page">AutoSaaz</span>
                        <span className="tagline-home-page">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-container-home-page">
                {/* Left Side - Image */}
                <div className="image-section-home-page">
                    <div className="garage-image-home-page">
                        <img 
                            src={`${process.env.PUBLIC_URL}/hero-login.png`}
                            alt="Auto mechanic and customer handshake in garage" 
                            className="hero-image-home-page"
                        />
                    </div>
                </div>

                {/* Right Side - Welcome Content */}
                <div className="welcome-section-home-page">
                    <div className="welcome-content-home-page">
                        {/* Logo */}
                        <div className="welcome-logo-home-page">
                            <img 
                                src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                                alt="AutoSaaz Logo" 
                                className="welcome-logo-image-home-page"
                            />
                        </div>

                        {/* Welcome Text */}
                        <div className="welcome-text-home-page">
                            <h1>Welcome to Auto Saaz</h1>
                            <h2>Garage Side</h2>
                        </div>

                        {/* Login Button */}
                        <Link to="/login" className="login-btn-home-page">
                            Login
                        </Link>

                        {/* Register Link */}
                        <div className="register-link-home-page">
                            <span>Don't have an account? </span>
                            <Link to="/register" className="register-now-home-page">Register Now</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
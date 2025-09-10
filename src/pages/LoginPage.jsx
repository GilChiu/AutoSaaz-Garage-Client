import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="garage-landing-login-page">
            {/* Header */}
            <div className="landing-header-login-page">
                <div className="header-logo-login-page">
                    <img 
                        src={`${process.env.PUBLIC_URL}/autoSaaz-logo.png`}
                        alt="AutoSaaz" 
                        className="header-logo-image-login-page"
                    />
                    <div className="header-text-login-page">
                        <span className="company-name-login-page">AutoSaaz</span>
                        <span className="tagline-login-page">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-container-login-page">
                {/* Left Side - Image */}
                <div className="image-section-login-page">
                    <div className="garage-image-login-page">
                        <img 
                            src={`${process.env.PUBLIC_URL}/hero-login2.png`}
                            alt="Auto mechanic working on car engine" 
                            className="hero-image-login-page"
                        />
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="form-section-login-page">
                    <div className="form-content-login-page">
                        <div className="form-header-login-page">
                            <h1>Welcome Back to Auto Saaz!</h1>
                        </div>

                        {error && <div className="error-message-login-page">{error}</div>}

                        <form onSubmit={handleSubmit} className="login-form-login-page">
                            <div className="form-group-login-page">
                                <label className='email-label-login-page'>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter Email"
                                    required
                                />
                            </div>

                            <div className="form-group-login-page">
                                <label>Password</label>
                                <div className="password-input-login-page">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-login-page"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        ) : (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a13.16 13.16 0 0 1-1.67 2.68"/>
                                                <path d="M6.61 6.61A13.526 13.526 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5-1.17"/>
                                                <line x1="2" y1="2" x2="22" y2="22"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="forgot-password-login-page">
                                <Link to="/forgot-password">forgot your password?</Link>
                            </div>

                            <button type="submit" className="signin-btn-login-page" disabled={loading}>
                                {loading ? 'Logging in...' : 'Log in'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="divider-login-page">
                            <span>or</span>
                        </div>

                        {/* Register Link */}
                        <div className="register-link-login-page">
                            <span>Don't have an account? </span>
                            <Link to="/register" className="register-now-login-page">Register Now</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
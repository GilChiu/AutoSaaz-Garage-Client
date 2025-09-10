import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import UpperNavbar from './UpperNavbar';
import Sidebar from '../Dashboard/Sidebar';
import './Layout.css';
import './Header.css';
import '../../styles/tokens.css';

const Layout = ({ children }) => {
    const location = useLocation();
    
    // Show different layout for auth pages, home page, and dashboard pages
    const isAuthPage = location.pathname === '/login' || 
                      location.pathname === '/register' || 
                      location.pathname === '/register-step-2' || 
                      location.pathname === '/verify-account' ||
                      location.pathname === '/forgot-password' ||
                      location.pathname === '/reset-verification' ||
                      location.pathname === '/reset-password' ||
                      location.pathname === '/password-reset-success';
    const isHomePage = location.pathname === '/';
    const isPublic = isAuthPage || isHomePage;

    const mainRef = useRef(null);

    // Scroll to top on pathname change for dashboard pages
    useEffect(() => {
        if (!isPublic && mainRef.current) {
            mainRef.current.scrollTop = 0; // in case main itself scrolls
            window.scrollTo({ top: 0, behavior: 'instant' || 'auto' });
        }
    }, [location.pathname, isPublic]);

    if (isPublic) return <div className="auth-layout">{children}</div>;

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="main-wrapper" ref={mainRef}>
                <UpperNavbar />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DEV_CONFIG from '../config/dev';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    // If auth is disabled, always allow access
    if (!DEV_CONFIG.ENABLE_AUTH) {
        return children;
    }

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '1.2rem'
            }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

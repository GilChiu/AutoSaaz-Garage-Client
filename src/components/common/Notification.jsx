import React, { useEffect, useState, useCallback } from 'react';
import './Notification.css';

const Notification = ({ 
    message, 
    type = 'success', // 'success', 'error', 'warning', 'info'
    isVisible, 
    onClose, 
    autoHide = true, 
    duration = 4000 
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClose = useCallback(() => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for exit animation
    }, [onClose]);

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true);
            
            if (autoHide) {
                const timer = setTimeout(() => {
                    handleClose();
                }, duration);
                
                return () => clearTimeout(timer);
            }
        }
    }, [isVisible, autoHide, duration, handleClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓';
            case 'error':
                return '✕';
            case 'warning':
                return '⚠';
            case 'info':
                return 'ℹ';
            default:
                return '✓';
        }
    };

    if (!isVisible) return null;

    return (
        <div className={`notification-overlay ${isAnimating ? 'visible' : ''}`}>
            <div className={`notification notification-${type} ${isAnimating ? 'slide-in' : 'slide-out'}`}>
                <div className="notification-content">
                    <div className="notification-icon">
                        {getIcon()}
                    </div>
                    <div className="notification-message">
                        {message}
                    </div>
                    <button 
                        className="notification-close"
                        onClick={handleClose}
                        aria-label="Close notification"
                    >
                        ✕
                    </button>
                </div>
                <div className={`notification-progress notification-progress-${type}`} 
                     style={{ animationDuration: `${duration}ms` }} />
            </div>
        </div>
    );
};

export default Notification;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, updateBooking, deleteBooking } from '../services/bookings.service';
import { getStatusDisplayText, getStatusCssClass } from '../services/mappers/bookingMappers';
import Notification from '../components/common/Notification';
import './BookingDetailPage.css';

const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [notification, setNotification] = useState({
        isVisible: false,
        message: '',
        type: 'success'
    });

    useEffect(() => {
        const controller = new AbortController();
        
        const loadBooking = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getBookingById(id, controller.signal);
                setBooking(data);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err.message || 'Failed to load booking');
                }
            } finally {
                setLoading(false);
            }
        };

        loadBooking();

        return () => controller.abort();
    }, [id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return "10:00 AM"; // Default fallback
        
        // If it's already formatted (e.g., "10:00 AM"), return as is
        if (timeString.includes('AM') || timeString.includes('PM')) {
            return timeString;
        }
        
        // If it's in HH:MM format, convert to 12-hour format
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        } catch {
            return "10:00 AM";
        }
    };

    const showNotification = (message, type = 'success') => {
        setNotification({
            isVisible: true,
            message,
            type
        });
    };

    const hideNotification = () => {
        setNotification(prev => ({
            ...prev,
            isVisible: false
        }));
    };

    const handleUpdateBooking = async () => {
        setIsUpdating(true);
        try {
            // Update booking status to confirmed if it's pending
            const updates = {
                status: booking.status === 'pending' ? 'confirmed' : booking.status
            };
            
            const updated = await updateBooking(id, updates);
            setBooking(updated);
            showNotification('Booking updated successfully!', 'success');
        } catch (err) {
            showNotification(err.message || 'Failed to update booking', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelBooking = async () => {
        setIsUpdating(true);
        try {
            await deleteBooking(id);
            showNotification('Booking cancelled successfully!', 'success');
            setShowCancelConfirm(false);
            
            // Navigate back to dashboard after a delay
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (err) {
            showNotification(err.message || 'Failed to cancel booking', 'error');
            setIsUpdating(false);
        }
    };

    const goBack = () => {
        navigate('/dashboard');
    };

    if (loading) {
        return (
            <div className="booking-detail-loading">
                <div className="loading-spinner">Loading booking details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-detail-error">
                <p>Error loading booking: {error}</p>
                <button onClick={goBack} className="back-btn">Back to Dashboard</button>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="booking-detail-not-found">
                <h2>Booking Not Found</h2>
                <p>The booking with ID #{id} could not be found.</p>
                <button onClick={goBack} className="back-btn">Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="booking-detail-page">
            <div className="booking-detail-container">
                {/* Header */}
                <div className="booking-detail-header">
                    <button onClick={goBack} className="back-button">
                        ← Back to Dashboard
                    </button>
                    <h1 className="booking-detail-title">Booking Details</h1>
                </div>

                {/* Booking Information Card */}
                <div className="booking-detail-card">
                    <div className="booking-detail-info">
                        <div className="booking-detail-row">
                            <label>Booking ID:</label>
                            <span className="booking-id">{booking.id}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Customer:</label>
                            <span className="customer-name">{booking.customer}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Service:</label>
                            <span className="service-type">{booking.service}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Date:</label>
                            <span className="appointment-date">{formatDate(booking.date)}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Time:</label>
                            <span className="appointment-time">{formatTime(booking.scheduledTime)}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Status:</label>
                            <span className={`status-badge ${getStatusCssClass(booking.status)}`}>
                                {getStatusDisplayText(booking.status)}
                            </span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Customer Phone:</label>
                            <span className="customer-phone">{booking.phone || 'Not provided'}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Vehicle:</label>
                            <span className="vehicle-info">
                                {booking.vehicle 
                                    ? `${booking.vehicle}${booking.plateNumber ? ` - ${booking.plateNumber}` : ''}`
                                    : 'Not specified'}
                            </span>
                        </div>
                        
                        <div className="booking-detail-row notes-row">
                            <label>Notes:</label>
                            <span className="booking-notes">
                                {booking.notes || 'No additional notes'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="booking-detail-actions">
                    <button 
                        onClick={handleUpdateBooking}
                        disabled={isUpdating || booking.status === 'completed'}
                        className={`update-btn ${booking.status === 'completed' ? 'disabled' : ''}`}
                    >
                        {isUpdating ? 'Updating...' : 'Update Booking'}
                    </button>
                    
                    <button 
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isUpdating || booking.status === 'completed'}
                        className={`cancel-btn ${booking.status === 'completed' ? 'disabled' : ''}`}
                    >
                        Cancel Booking
                    </button>
                </div>

                {/* Cancel Confirmation Modal */}
                {showCancelConfirm && (
                    <div className="modal-overlay">
                        <div className="cancel-confirm-modal">
                            <h3>Cancel Booking</h3>
                            <p>Are you sure you want to cancel booking {booking.id} for {booking.customer}?</p>
                            <div className="modal-actions">
                                <button 
                                    onClick={() => setShowCancelConfirm(false)}
                                    className="modal-btn secondary"
                                    disabled={isUpdating}
                                >
                                    Keep Booking
                                </button>
                                <button 
                                    onClick={handleCancelBooking}
                                    className="modal-btn danger"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Notification Component */}
            <Notification
                message={notification.message}
                type={notification.type}
                isVisible={notification.isVisible}
                onClose={hideNotification}
                autoHide={true}
                duration={4000}
            />
        </div>
    );
};

export default BookingDetailPage;
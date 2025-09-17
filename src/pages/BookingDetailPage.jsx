import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { getStatusDisplayText, getStatusCssClass } from '../services/mappers/bookingMappers';
import './BookingDetailPage.css';

const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: bookings, loading, error } = useBookings();
    const [booking, setBooking] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);

    useEffect(() => {
        if (bookings && id) {
            // Try to find booking by ID, handling both numeric and #-prefixed IDs
            const foundBooking = bookings.find(b => {
                const bookingId = b.id.toString().replace('#', '');
                return bookingId === id || b.id.toString() === id;
            });
            setBooking(foundBooking);
        }
    }, [bookings, id]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (dateString) => {
        // Mock time since our data doesn't have time
        return "10:00 AM";
    };

    const handleUpdateBooking = () => {
        setIsUpdating(true);
        // Mock update - in real app this would call an API
        setTimeout(() => {
            alert('Booking updated successfully!');
            setIsUpdating(false);
        }, 1000);
    };

    const handleCancelBooking = () => {
        setIsUpdating(true);
        // Mock cancel - in real app this would call an API
        setTimeout(() => {
            alert('Booking cancelled successfully!');
            setIsUpdating(false);
            setShowCancelConfirm(false);
            navigate('/dashboard');
        }, 1000);
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
                            <span className="appointment-time">{formatTime(booking.date)}</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Status:</label>
                            <span className={`status-badge ${getStatusCssClass(booking.status)}`}>
                                {getStatusDisplayText(booking.status)}
                            </span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Customer Phone:</label>
                            <span className="customer-phone">+971 50 123 4567</span>
                        </div>
                        
                        <div className="booking-detail-row">
                            <label>Vehicle:</label>
                            <span className="vehicle-info">Toyota Camry 2020 - ABC1234</span>
                        </div>
                        
                        <div className="booking-detail-row notes-row">
                            <label>Notes:</label>
                            <span className="booking-notes">
                                {booking.service === 'Oil Change' 
                                    ? 'Regular oil change service. Customer requested synthetic oil.'
                                    : booking.service === 'AC Repair'
                                    ? 'AC not cooling properly. Check refrigerant levels and compressor.'
                                    : 'Standard maintenance service as requested.'}
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
        </div>
    );
};

export default BookingDetailPage;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookingById, updateBooking, deleteBooking } from '../services/bookings.service';
import { getStatusDisplayText, getStatusCssClass } from '../services/mappers/bookingMappers';
import Notification from '../components/common/Notification';
import { LoadingOverlay } from '../components/common/LoadingCard';
import EmptyState from '../components/common/EmptyState';
import './BookingDetailPage.css';

const BookingDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        status: '',
        scheduledTime: '',
        notes: '',
        internalNotes: ''
    });
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
                
                // Initialize form with booking data
                if (data) {
                    setUpdateForm({
                        status: data.status || '',
                        scheduledTime: data.scheduledTime || '',
                        notes: data.notes || '',
                        internalNotes: data.internalNotes || ''
                    });
                }
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

    const handleUpdateModalOpen = () => {
        // Reset form with current booking data
        setUpdateForm({
            status: booking.status || '',
            scheduledTime: booking.scheduledTime || '',
            notes: booking.notes || '',
            internalNotes: booking.internalNotes || ''
        });
        setShowUpdateModal(true);
    };

    const handleUpdateFormChange = (field, value) => {
        setUpdateForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateBooking = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        
        try {
            // Prepare update payload - only send changed fields
            const updates = {};
            
            // Map UI status to API status
            if (updateForm.status && updateForm.status !== booking.status) {
                // Convert UI status back to API status
                let apiStatus = updateForm.status;
                if (updateForm.status === 'in_progress') {
                    apiStatus = 'in_progress';
                } else if (updateForm.status === 'completed') {
                    apiStatus = 'completed';
                } else if (updateForm.status === 'cancelled') {
                    apiStatus = 'cancelled';
                }
                updates.status = apiStatus;
            }
            
            if (updateForm.scheduledTime && updateForm.scheduledTime !== booking.scheduledTime) {
                updates.scheduled_time = updateForm.scheduledTime;
            }
            
            if (updateForm.notes !== booking.notes) {
                updates.notes = updateForm.notes || null;
            }
            
            if (updateForm.internalNotes !== booking.internalNotes) {
                updates.internal_notes = updateForm.internalNotes || null;
            }
            
            // Check if there are any changes
            if (Object.keys(updates).length === 0) {
                showNotification('No changes to update', 'info');
                setShowUpdateModal(false);
                setIsUpdating(false);
                return;
            }
            
            const updated = await updateBooking(booking.uuid || id.replace('#', ''), updates);
            setBooking(updated);
            setShowUpdateModal(false);
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
        return <LoadingOverlay message="Loading booking details..." />;
    }

    if (error) {
        return (
            <div className="booking-detail-page">
                <div className="booking-detail-container">
                    <EmptyState
                        variant="error"
                        title="Unable to Load Booking"
                        message={error}
                        actionLabel="Back to Dashboard"
                        onAction={goBack}
                    />
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="booking-detail-page">
                <div className="booking-detail-container">
                    <EmptyState
                        variant="search"
                        title="Booking Not Found"
                        message={`The booking with ID #${id} could not be found.`}
                        actionLabel="Back to Dashboard"
                        onAction={goBack}
                    />
                </div>
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
                        onClick={handleUpdateModalOpen}
                        disabled={isUpdating || booking.status === 'completed'}
                        className={`update-btn ${booking.status === 'completed' ? 'disabled' : ''}`}
                    >
                        Update Booking
                    </button>
                    
                    <button 
                        onClick={() => setShowCancelConfirm(true)}
                        disabled={isUpdating || booking.status === 'completed'}
                        className={`cancel-btn ${booking.status === 'completed' ? 'disabled' : ''}`}
                    >
                        Cancel Booking
                    </button>
                </div>

                {/* Update Booking Modal */}
                {showUpdateModal && (
                    <div className="modal-overlay" onClick={(e) => {
                        if (e.target.className === 'modal-overlay') {
                            setShowUpdateModal(false);
                        }
                    }}>
                        <div className="update-booking-modal">
                            <h3>Update Booking</h3>
                            <p className="modal-subtitle">Update booking details for {booking.customer}</p>
                            
                            <form onSubmit={handleUpdateBooking} className="update-form">
                                <div className="form-group">
                                    <label htmlFor="status">Status</label>
                                    <select
                                        id="status"
                                        value={updateForm.status}
                                        onChange={(e) => handleUpdateFormChange('status', e.target.value)}
                                        className="form-control"
                                    >
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="scheduledTime">Scheduled Time</label>
                                    <input
                                        type="time"
                                        id="scheduledTime"
                                        value={updateForm.scheduledTime}
                                        onChange={(e) => handleUpdateFormChange('scheduledTime', e.target.value)}
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="notes">Customer Notes</label>
                                    <textarea
                                        id="notes"
                                        value={updateForm.notes}
                                        onChange={(e) => handleUpdateFormChange('notes', e.target.value)}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Notes visible to customer..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="internalNotes">Internal Notes</label>
                                    <textarea
                                        id="internalNotes"
                                        value={updateForm.internalNotes}
                                        onChange={(e) => handleUpdateFormChange('internalNotes', e.target.value)}
                                        className="form-control"
                                        rows="3"
                                        placeholder="Internal notes (not visible to customer)..."
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button 
                                        type="button"
                                        onClick={() => setShowUpdateModal(false)}
                                        className="modal-btn secondary"
                                        disabled={isUpdating}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="modal-btn primary"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Updating...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
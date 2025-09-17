import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { getStatusDisplayText, getStatusCssClass } from '../../services/mappers/bookingMappers';
import './BookingSummary.css';

const BookingSummary = () => {
    const { data: bookings, loading, error } = useBookings();
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                console.warn(`Invalid date: ${dateString}`);
                return dateString; // Return original string if date is invalid
            }
            
            // Return the date in YYYY-MM-DD format
            return date.toISOString().split('T')[0];
        } catch (error) {
            console.error(`Error parsing date: ${dateString}`, error);
            return dateString; // Return original string if there's an error
        }
    };

    const handleBookingClick = (bookingId) => {
        // Remove the '#' prefix if it exists
        const numericId = bookingId.toString().replace('#', '');
        navigate(`/bookings/${numericId}`);
    };

    if (loading) {
        return (
            <div className="dashboard-booking-summary-loading">
                <div className="dashboard-loading-spinner">Loading bookings...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-booking-summary-error">
                <p>Error loading bookings: {error}</p>
            </div>
        );
    }

    return (
        <section className="dashboard-booking-summary">
            <header className="dashboard-section-header">
                <h2 className="dashboard-section-title">Booking Summary</h2>
            </header>
            
            {bookings.length === 0 ? (
                <div className="dashboard-no-bookings">
                    <p>No bookings found.</p>
                </div>
            ) : (
                <div className="dashboard-booking-table-container">
                    <table className="dashboard-booking-table">
                        <thead>
                            <tr>
                                <th>Booking ID</th>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr 
                                    key={booking.id} 
                                    className="dashboard-booking-row"
                                    onClick={() => handleBookingClick(booking.id.replace('#', ''))}
                                >
                                    <td className="dashboard-booking-id">{booking.id}</td>
                                    <td className="dashboard-customer-name">{booking.customer}</td>
                                    <td className="dashboard-service-type">{booking.service}</td>
                                    <td className="dashboard-booking-date">{formatDate(booking.date)}</td>
                                    <td className="dashboard-booking-status">
                                        <span className={`dashboard-status-badge dashboard-${getStatusCssClass(booking.status)}`}>
                                            {getStatusDisplayText(booking.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
};

export default BookingSummary;
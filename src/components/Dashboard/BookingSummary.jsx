import React from 'react';
import { useBookings } from '../../hooks/useBookings';
import { getStatusDisplayText, getStatusCssClass } from '../../services/mappers/bookingMappers';
import './BookingSummary.css';

const BookingSummary = () => {
    const { data: bookings, loading, error } = useBookings();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
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
                                <tr key={booking.id}>
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
import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';
import Sidebar from '../components/Dashboard/Sidebar';
import BookingSummary from '../components/Dashboard/BookingSummary';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';

const DashboardPage = () => {
    const { user } = useAuth();
    const { fetchBookings } = useApi();
    const [bookings, setBookings] = React.useState([]);

    React.useEffect(() => {
        const getBookings = async () => {
            const data = await fetchBookings(user.id);
            setBookings(data);
        };

        if (user) {
            getBookings();
        }
    }, [user, fetchBookings]);

    return (
        <div className="dashboard-page">
            <Sidebar />
            <main>
                <Dashboard user={user} />
                <BookingSummary bookings={bookings} />
            </main>
        </div>
    );
};

export default DashboardPage;
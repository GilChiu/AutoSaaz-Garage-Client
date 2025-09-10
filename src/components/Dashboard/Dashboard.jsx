import React from 'react';
import BookingSummary from './BookingSummary';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';
import './Dashboard.css';

const Dashboard = () => {
    useAuth(); // invoked to ensure auth context is initialized (user no longer needed here)

    return (
        <div className="dashboard-layout dashboard-tight">
            <Sidebar />
            <main className="dashboard-layout-main">
                <div className="dashboard-layout-content">
                    <div className="dashboard-page-section">
                        <BookingSummary />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
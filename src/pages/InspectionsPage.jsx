import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getInspections } from '../services/inspections.service';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './InspectionsPage.css';

const InspectionsPage = ({ type }) => {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Determine the current type from URL if not provided as prop
    const currentType = type || (location.pathname.includes('/pending') ? 'pending' : 
                                location.pathname.includes('/completed') ? 'completed' : 'pending');

    useEffect(() => {
        const fetchInspections = async () => {
            try {
                setLoading(true);
                const data = await getInspections();
                setInspections(data);
            } catch (err) {
                setError('Failed to load inspections');
                console.error('Error fetching inspections:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInspections();
    }, []);

    // Filter inspections based on current type
    const filteredInspections = inspections.filter(inspection => inspection.status === currentType);

    const handleViewDetails = (inspectionId) => {
        navigate(`/inspections/${inspectionId}`);
    };

    // Get page title and subtitle based on type
    const getPageInfo = () => {
        switch (currentType) {
            case 'pending':
                return {
                    title: 'Pending Inspections',
                    subtitle: 'Garage Overview and Activities'
                };
            case 'completed':
                return {
                    title: 'Completed Inspections',
                    subtitle: 'Garage Overview and Activities'
                };
            default:
                return {
                    title: 'Inspection',
                    subtitle: 'Garage Overview and Activities'
                };
        }
    };

    const pageInfo = getPageInfo();

    const InspectionCard = ({ inspection }) => (
        <div className="inspections-page-card">
            <div className="inspections-page-card-header">
                <h3 className="inspections-page-card-title">
                    {inspection.customer} - {inspection.vehicle}
                </h3>
                <p className="inspections-page-card-subtitle">
                    Inspection due today at {inspection.time} | Assigned: Technician {inspection.assignedTechnician}
                </p>
            </div>
            <div className="inspections-page-card-content">
                <div className="inspections-page-task-list">
                    {inspection.tasks.map((task, index) => (
                        <div key={index} className="inspections-page-task-item">
                            <span className="inspections-page-task-bullet">●</span>
                            <span className="inspections-page-task-text">{task}</span>
                        </div>
                    ))}
                </div>
                <button 
                    className="inspections-page-view-details-btn"
                    onClick={() => handleViewDetails(inspection.id)}
                >
                    View Details
                </button>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-layout-main">
                    <div className="dashboard-layout-header">
                        <div className="dashboard-header-left">
                            <h1 className="dashboard-layout-title">{pageInfo.title}</h1>
                            <p className="dashboard-layout-subtitle">{pageInfo.subtitle}</p>
                        </div>
                        <div className="dashboard-header-right">
                            <button className="dashboard-notification-btn" aria-label="Notifications">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            </button>
                            <button className="dashboard-settings-btn" aria-label="Settings">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                </svg>
                            </button>
                            <div className="dashboard-user-profile">
                                <div className="dashboard-user-info">
                                    <span className="dashboard-garage-name">AAA Auto Garage</span>
                                    <span className="dashboard-user-role">Mechanics</span>
                                </div>
                                <div className="dashboard-user-avatar">
                                    <span>A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-layout-content">
                        <div className="inspections-page-loading">Loading inspections...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-layout-main">
                    <div className="dashboard-layout-header">
                        <div className="dashboard-header-left">
                            <h1 className="dashboard-layout-title">{pageInfo.title}</h1>
                            <p className="dashboard-layout-subtitle">{pageInfo.subtitle}</p>
                        </div>
                        <div className="dashboard-header-right">
                            <button className="dashboard-notification-btn" aria-label="Notifications">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            </button>
                            <button className="dashboard-settings-btn" aria-label="Settings">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3"/>
                                    <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                </svg>
                            </button>
                            <div className="dashboard-user-profile">
                                <div className="dashboard-user-info">
                                    <span className="dashboard-garage-name">AAA Auto Garage</span>
                                    <span className="dashboard-user-role">Mechanics</span>
                                </div>
                                <div className="dashboard-user-avatar">
                                    <span>A</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="dashboard-layout-content">
                        <div className="inspections-page-error">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-layout-main">
                <div className="dashboard-layout-content">
                    <div className="inspections-page-section">
                        {/* Removed duplicate page title/subtitle (now in UpperNavbar) */}
                        <h2 className="inspections-page-section-title">{currentType === 'pending' ? 'Pending' : 'Completed Reports'}</h2>
                        <div className="inspections-page-cards">
                            {filteredInspections.length > 0 ? (
                                filteredInspections.map(inspection => (
                                    <InspectionCard key={inspection.id} inspection={inspection} />
                                ))
                            ) : (
                                <div className="inspections-page-empty">No {currentType} inspections</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectionsPage;

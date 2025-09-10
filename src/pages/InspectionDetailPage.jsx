import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspectionById, updateInspection } from '../services/inspections.service';
import Sidebar from '../components/Dashboard/Sidebar';
import '../components/Dashboard/Dashboard.css';
import './InspectionDetailPage.css';

const InspectionDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [inspection, setInspection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchInspection = async () => {
            try {
                setLoading(true);
                const data = await getInspectionById(id);
                if (data) {
                    setInspection(data);
                } else {
                    setError('Inspection not found');
                }
            } catch (err) {
                setError('Failed to load inspection details');
                console.error('Error fetching inspection:', err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInspection();
        }
    }, [id]);

    const handleMarkAsCompleted = async () => {
        if (!inspection) return;

        try {
            setUpdating(true);
            await updateInspection(inspection.id, { status: 'completed' });
            setInspection(prev => ({ ...prev, status: 'completed' }));
        } catch (err) {
            console.error('Error updating inspection:', err);
            // Show error message to user
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        navigate('/inspections');
    };

    if (loading) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-layout-main">
                    <div className="dashboard-layout-header">
                        <div className="dashboard-header-left">
                            <h1 className="dashboard-layout-title">Inspection</h1>
                            <p className="dashboard-layout-subtitle">Garage Overview and Activities</p>
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
                        <div className="inspection-detail-loading">Loading inspection details...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !inspection) {
        return (
            <div className="dashboard-layout">
                <Sidebar />
                <div className="dashboard-layout-main">
                    <div className="dashboard-layout-header">
                        <div className="dashboard-header-left">
                            <h1 className="dashboard-layout-title">Inspection</h1>
                            <p className="dashboard-layout-subtitle">Garage Overview and Activities</p>
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
                        <div className="inspection-detail-error">{error || 'Inspection not found'}</div>
                        <button 
                            className="inspection-detail-back-btn"
                            onClick={handleCancel}
                        >
                            Back to Inspections
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const isPending = inspection.status === 'pending';

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-layout-main">
                <div className="dashboard-layout-header">
                    <div className="dashboard-header-left">
                        <h1 className="dashboard-layout-title">Inspection</h1>
                        <p className="dashboard-layout-subtitle">Garage Overview and Activities</p>
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
                    <div className="inspection-detail-section">
                        <h2 className="inspection-detail-section-title">Details</h2>
                        
                        <div className="inspection-detail-card">
                            <div className="inspection-detail-card-header">
                                <h3 className="inspection-detail-card-title">
                                    Inspection Details - {inspection.vehicle}
                                </h3>
                            </div>
                            
                            <div className="inspection-detail-info-grid">
                                <div className="inspection-detail-info-row">
                                    <span className="inspection-detail-info-label">Customer:</span>
                                    <span className="inspection-detail-info-value">{inspection.customer}</span>
                                </div>
                                
                                <div className="inspection-detail-info-row">
                                    <span className="inspection-detail-info-label">Vehicle:</span>
                                    <span className="inspection-detail-info-value">{inspection.vehicle}</span>
                                </div>
                                
                                <div className="inspection-detail-info-row">
                                    <span className="inspection-detail-info-label">Date:</span>
                                    <span className="inspection-detail-info-value">
                                        {new Date(inspection.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                
                                <div className="inspection-detail-info-row">
                                    <span className="inspection-detail-info-label">Time:</span>
                                    <span className="inspection-detail-info-value">{inspection.time}</span>
                                </div>
                                
                                <div className="inspection-detail-info-row">
                                    <span className="inspection-detail-info-label">Assigned Technician:</span>
                                    <span className="inspection-detail-info-value">{inspection.assignedTechnician}</span>
                                </div>
                                
                                <div className="inspection-detail-info-row">
                                    <span className="inspection-detail-info-label">Status:</span>
                                    <span className={`inspection-detail-status inspection-detail-status-${inspection.status}`}>
                                        {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="inspection-detail-tasks">
                                <h4 className="inspection-detail-tasks-title">Task List</h4>
                                <div className="inspection-detail-task-list">
                                    {inspection.tasks.map((task, index) => (
                                        <div key={index} className="inspection-detail-task-item">
                                            <span className="inspection-detail-task-bullet">●</span>
                                            <span className="inspection-detail-task-text">{task}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="inspection-detail-actions">
                                {isPending && (
                                    <button 
                                        className="inspection-detail-complete-btn"
                                        onClick={handleMarkAsCompleted}
                                        disabled={updating}
                                    >
                                        {updating ? 'Updating...' : 'Mark as Completed'}
                                    </button>
                                )}
                                <button 
                                    className="inspection-detail-cancel-btn"
                                    onClick={handleCancel}
                                >
                                    {isPending ? 'Cancel' : 'Back'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InspectionDetailPage;

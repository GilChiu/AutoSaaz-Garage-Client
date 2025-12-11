import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInspectionById, completeInspection } from '../services/inspections.service';
import Sidebar from '../components/Dashboard/Sidebar';
import { formatDateGST } from '../utils/gstDateTime';
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
            console.log('🔄 [handleMarkAsCompleted] Starting completion for:', inspection.id);
            
            // Call the dedicated complete endpoint so completed_at and other fields are set server-side
            const updated = await completeInspection(inspection.id, {
                // You can pass findings/recommendations/actual_cost here if a form is added later
            });
            
            console.log('✅ [handleMarkAsCompleted] Completion successful:', updated);
            
            // Refetch the inspection to get fresh data from server
            console.log('🔄 [handleMarkAsCompleted] Refetching inspection data...');
            const freshData = await getInspectionById(inspection.id);
            setInspection(freshData);
            
            console.log('✅ [handleMarkAsCompleted] UI updated with fresh data');
            
            // Navigate to Completed tab to reflect the change in list view
            setTimeout(() => {
                navigate('/inspections/completed');
            }, 300);
        } catch (err) {
            console.error('❌ [handleMarkAsCompleted] Error:', err);
            setError('Failed to complete inspection: ' + (err.message || 'Unknown error'));
            // Optionally surface a toast/message here
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
                    <div className="dashboard-layout-content">
                        <h1 className="dashboard-layout-title">Inspection</h1>
                        <p className="dashboard-layout-subtitle">Garage Overview and Activities</p>
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
                    <div className="dashboard-layout-content">
                        <h1 className="dashboard-layout-title">Inspection</h1>
                        <p className="dashboard-layout-subtitle">Garage Overview and Activities</p>
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
                <div className="dashboard-layout-content">
                    <h1 className="dashboard-layout-title">Inspection</h1>
                    <p className="dashboard-layout-subtitle">Garage Overview and Activities</p>
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
                                        {formatDateGST(inspection.date)}
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

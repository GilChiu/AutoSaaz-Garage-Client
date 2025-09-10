import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Debug version marker so user can confirm updated Sidebar is mounted
    useEffect(() => {
        // eslint-disable-next-line no-console
        console.log('[Sidebar v2] mounted – inspections group enhanced');
    }, []);

    const isInInspections = location.pathname.startsWith('/inspections');
    const isInResolution = location.pathname.startsWith('/resolution-center');
    const isInSettings = location.pathname.startsWith('/settings');
    const [inspectionsExpanded, setInspectionsExpanded] = useState(isInInspections);
    const [resolutionExpanded, setResolutionExpanded] = useState(isInResolution);
    const [settingsExpanded, setSettingsExpanded] = useState(isInSettings);
    const inspectionsGroupRef = useRef(null);
    const resolutionGroupRef = useRef(null);
    const settingsGroupRef = useRef(null);

    // Sync expand state with URL location
    useEffect(() => {
        if (isInInspections) {
            if (!inspectionsExpanded) setInspectionsExpanded(true);
            requestAnimationFrame(() => {
                if (inspectionsGroupRef.current) {
                    inspectionsGroupRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        } else {
            const collapseTimer = setTimeout(() => setInspectionsExpanded(false), 110);
            return () => clearTimeout(collapseTimer);
        }
    }, [isInInspections, inspectionsExpanded]);

    useEffect(() => {
        if (isInResolution) {
            if (!resolutionExpanded) setResolutionExpanded(true);
            requestAnimationFrame(() => {
                if (resolutionGroupRef.current) {
                    resolutionGroupRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        } else {
            const collapseTimer = setTimeout(() => setResolutionExpanded(false), 110);
            return () => clearTimeout(collapseTimer);
        }
    }, [isInResolution, resolutionExpanded]);

    useEffect(() => {
        if (isInSettings) {
            if (!settingsExpanded) setSettingsExpanded(true);
            requestAnimationFrame(() => {
                if (settingsGroupRef.current) {
                    settingsGroupRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        } else {
            const collapseTimer = setTimeout(() => setSettingsExpanded(false), 110);
            return () => clearTimeout(collapseTimer);
        }
    }, [isInSettings, settingsExpanded]);

    const handleInspectionsParentClick = () => {
        navigate('/inspections/pending');
        setInspectionsExpanded(true);
    };
    const handleResolutionParentClick = () => {
        navigate('/resolution-center/new');
        setResolutionExpanded(true);
    };
    const handleSettingsParentClick = () => {
        navigate('/settings/profile');
        setSettingsExpanded(true);
    };

    return (
        <aside className="dashboard-sidebar" role="navigation" aria-label="Main navigation">
            <div className="dashboard-sidebar-header">
                <div className="dashboard-logo">
                    <div className="dashboard-logo-icon" aria-hidden="true">
                        <span>A</span>
                    </div>
                    <div className="dashboard-logo-text">
                        <span className="dashboard-logo-name">AutoSaaz</span>
                        <span className="dashboard-logo-subtitle">One Stop Auto Shop</span>
                    </div>
                </div>
            </div>
            
            <nav className="dashboard-sidebar-nav">
                <ul>
                    <li>
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => isActive ? "dashboard-nav-link active" : "dashboard-nav-link"}
                            aria-label="Dashboard"
                        >
                            <div className="dashboard-nav-icon dashboard-icon" aria-hidden="true">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                                </svg>
                            </div>
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/appointments" 
                            className={({ isActive }) => isActive ? "dashboard-nav-link active" : "dashboard-nav-link"}
                            aria-label="Appointments"
                        >
                            <div className="dashboard-nav-icon" aria-hidden="true">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                            </div>
                            <span>Appointments</span>
                        </NavLink>
                    </li>
                    <li>
                        <div ref={inspectionsGroupRef} className={`dashboard-nav-group inspections-nav-group ${inspectionsExpanded ? 'expanded' : ''}`}>
                            <button
                                type="button"
                                onClick={handleInspectionsParentClick}
                                className={`dashboard-nav-group-header ${isInInspections ? 'active' : ''}`}
                                aria-label="Inspections"
                                aria-expanded={inspectionsExpanded}
                            >
                                <div className="dashboard-nav-icon" aria-hidden="true">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14,2 14,8 20,8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10,9 9,9 8,9"/>
                                    </svg>
                                </div>
                                <span className="dashboard-nav-group-title">Inspections</span>
                                <span className="sidebar-inspections-chevron" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </span>
                            </button>
                            <div className={`sidebar-inspections-subitems-wrapper ${inspectionsExpanded ? 'open' : ''}`} aria-hidden={!inspectionsExpanded}>
                                <ul className="dashboard-nav-subitems" role="menu" aria-label="Inspection sub navigation">
                                    <li>
                                        <NavLink
                                            to="/inspections/pending"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="Pending Inspections"
                                            role="menuitem"
                                        >
                                            <span>Pending</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/inspections/completed"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="Completed Inspections"
                                            role="menuitem"
                                        >
                                            <span>Completed</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>
                    <li>
                        <NavLink 
                            to="/chats" 
                            className={({ isActive }) => isActive ? "dashboard-nav-link active" : "dashboard-nav-link"}
                            aria-label="Chats"
                        >
                            <div className="dashboard-nav-icon" aria-hidden="true">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                </svg>
                            </div>
                            <span>Chats</span>
                        </NavLink>
                    </li>
                    <li>
                        <div ref={resolutionGroupRef} className={`dashboard-nav-group resolution-nav-group ${resolutionExpanded ? 'expanded' : ''}`}>
                            <button
                                type="button"
                                onClick={handleResolutionParentClick}
                                className={`dashboard-nav-group-header ${isInResolution ? 'active' : ''}`}
                                aria-label="Resolution Center"
                                aria-expanded={resolutionExpanded}
                            >
                                <div className="dashboard-nav-icon" aria-hidden="true">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                    </svg>
                                </div>
                                <span className="dashboard-nav-group-title">Resolution Center</span>
                                <span className="sidebar-inspections-chevron" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </span>
                            </button>
                            <div className={`sidebar-inspections-subitems-wrapper ${resolutionExpanded ? 'open' : ''}`} aria-hidden={!resolutionExpanded}>
                                <ul className="dashboard-nav-subitems" role="menu" aria-label="Resolution center sub navigation">
                                    <li>
                                        <NavLink
                                            to="/resolution-center/new"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="New Disputes"
                                            role="menuitem"
                                        >
                                            <span>New Disputes</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/resolution-center/resolved"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="Resolved Disputes"
                                            role="menuitem"
                                        >
                                            <span>Resolved</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
            
            <div className="dashboard-sidebar-footer">
                <ul>
                    <li>
                        <div ref={settingsGroupRef} className={`dashboard-nav-group settings-nav-group ${settingsExpanded ? 'expanded' : ''}`}>
                            <button
                                type="button"
                                onClick={handleSettingsParentClick}
                                className={`dashboard-nav-group-header ${isInSettings ? 'active' : ''}`}
                                aria-label="Settings"
                                aria-expanded={settingsExpanded}
                            >
                                <div className="dashboard-nav-icon" aria-hidden="true">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/>
                                    </svg>
                                </div>
                                <span className="dashboard-nav-group-title">Setting</span>
                                <span className="sidebar-inspections-chevron" aria-hidden="true">
                                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </span>
                            </button>
                            <div className={`sidebar-inspections-subitems-wrapper ${settingsExpanded ? 'open' : ''}`} aria-hidden={!settingsExpanded}>
                                <ul className="dashboard-nav-subitems" role="menu" aria-label="Settings sub navigation">
                                    <li>
                                        <NavLink
                                            to="/settings/profile"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="Profile Settings"
                                            role="menuitem"
                                        >
                                            <span>Profile Settings</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/settings/services"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="Service Management"
                                            role="menuitem"
                                        >
                                            <span>Service Management</span>
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink
                                            to="/settings/account"
                                            className={({ isActive }) => isActive ? "dashboard-nav-sublink active" : "dashboard-nav-sublink"}
                                            aria-label="Account Settings"
                                            role="menuitem"
                                        >
                                            <span>Account Settings</span>
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </li>
                    <li>
                        <button 
                            onClick={handleLogout} 
                            className="dashboard-nav-link dashboard-logout-btn"
                            aria-label="Log out"
                        >
                            <div className="dashboard-nav-icon" aria-hidden="true">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16,17 21,12 16,7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </div>
                            <span>Log out</span>
                        </button>
                    </li>
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
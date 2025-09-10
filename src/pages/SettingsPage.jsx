import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Redirect bare /settings to profile sub-tab
const SettingsPage = () => {
    const navigate = useNavigate();
    useEffect(() => { navigate('/settings/profile', { replace: true }); }, [navigate]);
    return null;
};

export default SettingsPage;


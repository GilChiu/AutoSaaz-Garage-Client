import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Legacy placeholder now immediately redirects to /resolution-center/new
const ResolutionCenterPage = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate('/resolution-center/new', { replace: true });
    }, [navigate]);
    return null;
};

export default ResolutionCenterPage;

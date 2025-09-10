import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, registerUser, verifyUser } from '../services/api';

const useAuth = () => {
    const { setAuthData } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginUser(credentials);
            setAuthData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await registerUser(userData);
            setAuthData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const verify = async (verificationData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await verifyUser(verificationData);
            setAuthData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        login,
        register,
        verify,
        loading,
        error,
    };
};

export default useAuth;
export { useAuth };
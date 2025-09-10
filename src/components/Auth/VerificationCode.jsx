import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { verifyCode } from '../../services/api';

const VerificationCode = () => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const history = useHistory();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await verifyCode(code);
            if (response.success) {
                history.push('/login'); // Redirect to login on success
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="verification-code">
            <h2>Verify Your Account</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter verification code"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'}
                </button>
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
};

export default VerificationCode;
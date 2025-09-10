import { useState, useEffect } from 'react';
import axios from 'axios';

const useApi = (url, method = 'GET', body = null) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios({
                    method,
                    url,
                    data: body,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                setData(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url, method, body]);

    return { data, error, loading };
};

export default useApi;
export { useApi };
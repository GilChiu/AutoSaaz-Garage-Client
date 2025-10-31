import { useState, useEffect } from 'react';
import axios from 'axios';
import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const useApi = (url, method = 'GET', body = null) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios({
                    method,
                    url: url.startsWith('http') ? url : `${FUNCTIONS_URL}${url}`,
                    data: body,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        ...(localStorage.getItem('accessToken') && { 'x-autosaaz-token': localStorage.getItem('accessToken') }),
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
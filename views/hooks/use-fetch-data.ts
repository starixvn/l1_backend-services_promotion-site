import { useState, useEffect, useCallback } from 'react';
import { GameUtils, ParamsHelper } from '../helpers';
import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';


const useFetchData = <T,>(url: string) => {
    const [result, setResult] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AxiosError | null>(null);
    const { sessionId, username } = ParamsHelper.getParams();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            axiosRetry(axios, { retryDelay: axiosRetry.exponentialDelay });
            const response = await axios.post<T>(url, {
                sessionId: GameUtils.base64Decode(sessionId),
                username,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            setResult(response.data);
        } catch (error) {
            console.log(error);
            setError(error as AxiosError);
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { result, loading, error };
}

export default useFetchData;

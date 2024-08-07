import { useState, useEffect } from 'react';
import { GameUtils, ParamsHelper } from '../helpers';
import axios, { AxiosError } from 'axios';

const useFetchData = <T,>(url: string) => {
    const [result, setResult] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<AxiosError | null>(null);
    const { sessionId, username } = ParamsHelper.getParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
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
                setError(error as AxiosError);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { result, loading, error };
}

export default useFetchData;

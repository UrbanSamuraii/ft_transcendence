import { useEffect, useState } from "react";
import axios, { AxiosRequestConfig } from 'axios';
const server_adress = process.env.REACT_APP_SERVER_ADRESS;

export function useAuth() {
    const [user, setUser] = useState<any>();
    const [loading, setLoading] = useState(true);

    const API_URL = `http://${server_adress}:3001`;
    const config: AxiosRequestConfig = { withCredentials: true };

    const checkAuthStatus = () => {
        setLoading(true);
        axios.get(`${API_URL}/auth/me`, config)
            .then(({ data }) => {
                console.log({ "DATA from getAuthUser": data });
                setUser(data);
            })
            .catch((err) => {
                console.error('Auth check failed:', err);
                setUser(null); // Or handle the error as required
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    return { user, loading, checkAuthStatus };
}

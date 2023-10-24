import axios, {AxiosRequestConfig} from 'axios';

const API_URL = 'http://localhost:3001';
const config: AxiosRequestConfig = { withCredentials: true };

export const getAuthUser = () => axios.get(`${API_URL}/auth/me`, config);
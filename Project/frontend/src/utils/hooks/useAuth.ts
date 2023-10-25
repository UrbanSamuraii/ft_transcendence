import { useEffect, useState } from "react";
import axios, {AxiosRequestConfig} from 'axios';

export function useAuth() {
	
	const [user, setUser] = useState();
	const [loading, setLoading] = useState(true);

	const API_URL = 'http://localhost:3001';
	const config: AxiosRequestConfig = { withCredentials: true };

	useEffect(() => {
		axios.get(`${API_URL}/auth/me`, config)
		  .then(({ data }) => {
			console.log({"DATA from getAuthUser" : data});
			setUser(data);
			setTimeout(() => setLoading(false), 1000);
		  })
		  .catch((err) => {
			setTimeout(() => setLoading(false), 1000);
		  });
		}, []);
	
	  return { user, loading };
}
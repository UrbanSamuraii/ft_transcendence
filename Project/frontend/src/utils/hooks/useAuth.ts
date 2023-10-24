import { useEffect, useState } from "react";
import { getAuthUser } from "../api";


export function useAuth() {
	
	const [user, setUser] = useState();
	const [loading, setLoading] = useState(true);
	const controller = new AbortController();

	useEffect(() => {
		getAuthUser()
		  .then(({ data }) => {
			setUser(data);
			setTimeout(() => setLoading(false), 1000);
		  })
		  .catch((err) => {
			setTimeout(() => setLoading(false), 1000);
		  });
	  
		return () => {
			controller.abort();
		};
		}, []);
	
	  return { user, loading };
}
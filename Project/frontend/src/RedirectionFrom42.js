import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const CustomRedirectionFrom42Route = ({ cameFromSignup42, ...props }) => {
	if (cameFromSignup42 && props.path === '/play') {
		return <Navigate to="http://localhost:3000" />;
	} else {
		return <Route {...props} />;
	}
};

export default CustomRedirectionFrom42Route;

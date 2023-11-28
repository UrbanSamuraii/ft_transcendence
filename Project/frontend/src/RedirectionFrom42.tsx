import React from 'react';
import { Route, Navigate } from 'react-router-dom';

interface CustomRedirectionFrom42RouteProps {
    cameFromSignup42: boolean;
    path: string;
}

const CustomRedirectionFrom42Route: React.FC<CustomRedirectionFrom42RouteProps> = ({
    cameFromSignup42,
    ...props
}) => {
    if (cameFromSignup42 && props.path === '/') {
        return <Navigate to="http://localhost:3000" />;
    } else {
        return <Route {...props} />;
    }
};

export default CustomRedirectionFrom42Route;


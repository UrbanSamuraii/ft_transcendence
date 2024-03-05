import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css'

const NotFound = () => {
    return (
        <div className='not-found-page'>
            <h1>404 - Not Found</h1>
            <Link className='go-home-link' to="/">Go Home</Link>
        </div>
    );
};

export default NotFound;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleSignInClick = () => {
        navigate('/login');
    };

    const fetchUserInfo = async () => {
        try {
            const response = await fetch('http://localhost:3001/auth/user-info', {
                method: 'GET',
                credentials: 'include' // To send cookies along with the request
            });
            const data = await response.json();
            if (response.ok) {
                setUsername(data.username);
            } else {
                console.error('Failed to fetch user info:', data.error);
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
        }
    };

    const handleProfileClick = () => {
        if (!username) {
            fetchUserInfo();
        }
    };

    return (
        <div className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-logo">MyLogo</Link>
            </div>
            <div className="navbar-center">
                <Link to="/games">Games</Link>
                <Link to="/tournaments">Tournaments</Link>
                <Link to="/learn">Learn</Link>
            </div>
            <div className="navbar-right">
                <Link to={username ? `/@/${username}` : '/'} onClick={handleProfileClick}>My Profile</Link>
                <Link to="/settings">Settings</Link>
                <button onClick={handleSignInClick}>SIGN IN</button>
            </div>
        </div>
    );
}

export default Navbar;

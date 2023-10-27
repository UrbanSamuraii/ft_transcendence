import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
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
                <Link to="/profile">My Profile</Link>
                <Link to="/settings">Settings</Link>
            </div>
        </div>
    );
}

export default Navbar;

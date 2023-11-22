import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../AuthContext'; // Update the path accordingly

function Navbar() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSignInClick = () => {
        navigate('/login');
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
                <Link to="/settings">Settings</Link>
                {user ? (
                    <>
                        <Link to={`/@/${user.username}`}> {user.username}</Link>
                    </>
                ) : (
                    <button onClick={handleSignInClick}>SIGN IN</button>
                )}
            </div>
        </div>
    );
}

export default Navbar;

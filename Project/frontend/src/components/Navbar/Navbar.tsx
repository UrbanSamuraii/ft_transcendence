// import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../AuthContext'; // Update the path accordingly

function Navbar() {
    const navigate = useNavigate();
    const { user } = useAuth();
    // const [showNavbar, setShowNavbar] = useState(false);

    // useEffect(() => {
    //     const handleMouseMove = (e: MouseEvent) => {
    //     if (e.clientY < 80) {
    //         setShowNavbar(true);
    //     } else {
    //         setShowNavbar(false);
    //     }
    // };
    // window.addEventListener('mousemove', handleMouseMove);
    // return () => {
    //     window.removeEventListener('mousemove', handleMouseMove);
    // };
    // }, []);

    return (
        // <div className={`navbar ${showNavbar ? 'show' : ''}`}>
        <div className="navbar">
            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
            <div className="navbar-left">
                <div className='navbar-button'>
                <Link to="/" className="navbar-logo">
                    {/* <i className='bx bxs-tennis-ball' ></i> */}
                    </Link>
                </div>
            </div>
            <div className="navbar-center">
                <div className='navbar-button'>
                    <Link to="/tournaments">Tournaments</Link>
                </div>
                <div className='navbar-button'>
                    <Link to="/ConversationPage">Chat</Link>
                </div>
                <div className='navbar-button'>
                    <Link to="/leaderboard">Leaderboard</Link>
                </div>
            </div>
            <div className="navbar-right">
                {user ? (
                <div className='navbar-button'>
                    <Link to={`/@/${user.username}`} className='navbar-button'>{user.username}</Link>
                </div>
                ) : (
                    <div className='navbar-button'>
                        <button onClick={() => navigate('/login')}>SIGN IN</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Navbar;

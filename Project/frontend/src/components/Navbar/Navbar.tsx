import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../AuthContext'; // Update the path accordingly

function Navbar() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null); // Typed as HTMLDivElement

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        // Add event listener
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup the event listener
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                {user ? (
                    <>
                        <div onClick={toggleDropdown} className="profile-name">
                            {user.username}
                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    <Link to={`/@/${user.username}`}>Profile</Link>
                                    <Link to="/ConversationPage">Chat</Link>
                                    <Link to="/preferences">Preferences</Link>
                                    <Link to="/signout">Sign out</Link>
                                    {/* <button onClick={handleSignoutClick}>Sign Out</button> */}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')}>SIGN IN</button>
                )}
            </div>
        </div>
    );
}

export default Navbar;

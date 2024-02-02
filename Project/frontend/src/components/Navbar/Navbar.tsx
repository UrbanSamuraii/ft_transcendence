import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import { useAuth } from '../../AuthContext';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getInvitationsList } from '../../utils/hooks/getInvitationsList';

function Navbar() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [hasInvitations, setHasInvitations] = useState(false);

    useEffect(() => {
        const fetchInvitations = async () => {
            try {
                const invitationsList = await getInvitationsList();
                setHasInvitations(invitationsList.length > 0);
            } catch (error) {
                console.error('Error fetching invitations:', error);
            }
        };

        if (user) {
            fetchInvitations();
        }
    }, [user]);

    return (
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
                {user && (
                    <>
                        <div className='navbar-button'>
                            <Link to="/ConversationPage">Chat</Link>
                        </div>
                        <div className='navbar-button'>
                            <Link to="/leaderboard">Leaderboard</Link>
                        </div>
                        {/* <div className='navbar-button'>
                            <Link to="/friends">Friends</Link>
                        </div> */}
                        <div className={`navbar-button ${hasInvitations ? 'has-invitations' : ''}`}>
                            <Link to="/friends">Friends</Link>
                            {hasInvitations && <div className="invitation-star">&#9733;</div>}
                        </div>
                    </>
                )}
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

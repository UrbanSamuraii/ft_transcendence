import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css'

function Profile() {
    const [userInfo, setUserInfo] = useState({ username: '', email: '', totalGamesWon: 0 });
    const { username } = useParams(); // Extract the username from the URL

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                // Use the username from the URL in the API request
                const response = await fetch(`http://localhost:3001/auth/user-info/${username}`, {
                    method: 'GET',
                    credentials: 'include' // To send cookies along with the request
                });
                const data = await response.json();
                if (response.ok) {
                    setUserInfo(data);
                } else {
                    console.error('Failed to fetch user info:', data.error);
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        if (username) {
            fetchUserInfo();
        }
    }, [username]);

    return (
        <div className="profile-container">
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
            <p>Games Won: {userInfo.totalGamesWon}</p>
            <Link to={`/@/${username}/leaderboard`} className="profile-button">
                View Leaderboard
            </Link>
            <button className="profile-button">Edit Profile</button>
        </div>
    );

}

export default Profile;

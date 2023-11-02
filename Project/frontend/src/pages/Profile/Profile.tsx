import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function Profile() {
    const [userInfo, setUserInfo] = useState({ username: '', email: '' });
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
    }, [username]); // Dependency array includes username to refetch if it changes

    return (
        <div>
            <h1>Profile Page</h1>
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
            {/* Display other user info as needed */}
        </div>
    );
}

export default Profile;

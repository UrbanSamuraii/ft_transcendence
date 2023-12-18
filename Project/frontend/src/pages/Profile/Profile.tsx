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

    <div className="bruh">
        <head>
            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
        </head>

        <body className='some-class'>
        <div className="card">
            <div className="additional">
                <div className="user-card">
                    {/* <div className="level center">Level 13</div> */}
                    {/* <div className='profile-picture'>
                    <img src="https://openseauserdata.com/files/b261626a159edf64a8a92aa7306053b8.png"
                    className="center rounded-image" width="115" height="115"/></div> */}
                    {/* <div className="points center">5,312 Points</div> */}
                </div>
                <div className="more-info">
                    <h1>{userInfo.username}</h1>
                    <div className="coords">
                        <span>E-mail</span>
                        <span>{userInfo.email}</span>
                    </div>
                    <div className="stats">
                        <div>
                            <div className="title">Games won</div>
                            <i className='bx bxs-trophy'></i>
                            <div className="value">{userInfo.totalGamesWon}</div>
                        </div>
                        <div>
                            <div className="title">Matches</div>
                            <i className='bx bxs-joystick'></i>
                            <div className="value">todo</div>
                        </div>
                        <div>
                            <div className="title">Pals</div>
                            <i className='bx bxs-group'></i>
                            <div className="value">todo</div>
                        </div>
                        <div>
                            <div className="title">Beer</div>
                            <i className='bx bxs-beer'></i>
                            <div className="value infinity">∞</div>
                        </div>
                    </div>
                    <div className="buttons">
                        <button className="edit-profile">
                        <i className='bx bxs-pencil'></i></button>
                        <Link to={`/@/${username}/leaderboard`} className="leaderboard-button">
                        Leaderboard</Link>
                    </div>
                </div>
            </div>
            <div className="general">
                <h1>{userInfo.username}</h1>
            </div>
        </div>
        </body>
    </div>
    );
}


export default Profile;

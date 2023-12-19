import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css'

function Profile() {
    const [userInfo, setUserInfo] = useState({ username: '', email: '', totalGamesWon: 0 });
    const { username } = useParams(); // Extract the username from the URL
    const totalGamesPlayed = 15; //example

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

    const getSkillBarWidth = () => {
        if (userInfo.totalGamesWon) {
            const winRate = (userInfo.totalGamesWon / totalGamesPlayed) * 100;
            return {
                width: `${winRate}%`,
                maxWidth: `${winRate}%`,
            }
        } else {
            return {
                width: '60%',
                maxWidth: '60%',
            };
        }
    };

    return (

    <div className="bruh">
        <head>
            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
        </head>

        <body className='some-class'>
        <div className="card">
                <div className="user-card">
                    {/* <div className="level">Level 13</div> */}
                    <div className='profile-picture'>
                    <img src="https://openseauserdata.com/files/b261626a159edf64a8a92aa7306053b8.png"
                className="rounded-image" width="115" height="115"/></div>
                    {/* <div className="points">5,312 Points</div> */}
                </div>
                <div className="more-info">
                    <h1>{userInfo.username}</h1>
                    <button className="edit-profile">
                    <i className='bx bxs-pencil'></i></button>
                    <div className='separator'></div>
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
                            <div className="value">{totalGamesPlayed}</div>
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
                    <div className='skill-name'>Winrate</div>
                    <div className='skill-bar'>
                        <div className='skill-per' style={getSkillBarWidth()}></div>
                    </div>
                    <Link to={`/@/${username}/leaderboard`} className="leaderboard-button">
                    Leaderboard</Link>
                </div>
        </div>
        </body>
    </div>
    );
}


export default Profile;

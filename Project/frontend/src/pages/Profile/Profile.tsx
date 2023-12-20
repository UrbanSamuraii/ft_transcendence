import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Profile.css'

function Profile() {
    const [theme, setTheme] = useState('bw-style'); // Default theme
    const [userInfo, setUserInfo] = useState({ username: '', email: '', eloRating: '', totalGamesWon: 0, totalGamesLost: 0 });
    const { username } = useParams(); // Extract the username from the URL
    const totalGamesPlayed = userInfo.totalGamesWon + userInfo.totalGamesLost; //example

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

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'bw-style' ? 'cyber-style' : 'bw-style');
    };

    const getSkillBarWidth = () => {
        if (userInfo.totalGamesWon) {
            const winRate = (userInfo.totalGamesWon / totalGamesPlayed) * 100;
            return {
                width: `${winRate}%`,
                maxWidth: `${winRate}%`,
            }
        } else {
            return {
                width: '0%',
                maxWidth: '0%',
            };
        }
    };

    let winrateValue = '0%';

    if (totalGamesPlayed !== 0) {
        winrateValue = `${((userInfo.totalGamesWon / totalGamesPlayed) * 100).toFixed(2)}%`;
    }

    const getEloRank = (eloRating: number): string => {
        if (eloRating < 1000 || totalGamesPlayed == 0) {
            return 'just beginning';
        } else if (eloRating < 1100) {
            return 'getting there';
        } else if (eloRating < 1200) {
            return 'rock solid';
        } else if (eloRating < 1300) {
            return 'got swagger';
        } else if (eloRating < 1400) {
            return 'the hotness';
        } else if (eloRating < 1500) {
            return 'simply amazing';
        } else {
            return 'pinnacle of awesomeness';
        }
    };

    return (

    <div className="bruh">
        <head>
            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
        </head>
        
        {/* bw  cyber  rainbow  retrowave */}
        <body className={theme}>
        <div className="card">
                {/* <div className="user-card rainbow"> */}
                {/* <div className="user-card retrowave"> */}
                <div className={`user-card ${theme}`}>
                    <div className="level">{getEloRank(+userInfo.eloRating)}</div>
                    <div className='profile-picture'>
                    <img src="https://openseauserdata.com/files/b261626a159edf64a8a92aa7306053b8.png"
                className="rounded-image" width="135" height="135"/></div>
                <div className="points">{userInfo.eloRating}</div>
                </div>
                <div className="more-info">
                    <h1>{userInfo.username}</h1>
                    <button className="edit-profile" onClick={toggleTheme}>
                    <i className='bx bxs-palette'></i></button>
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
                    <div className='skill-name'>Winrate {winrateValue}</div>
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

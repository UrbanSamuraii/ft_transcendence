import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import './Profile.css'
import { useAuth } from '../../utils/hooks/useAuthHook';
const server_adress = process.env.REACT_APP_SERVER_ADRESS;

function Profile() {
    const [theme, setTheme] = useState('bw-style'); // Default theme
    const [userInfo, setUserInfo] = useState({ username: '', email: '', eloRating: '', totalGamesWon: 0, totalGamesLost: 0, img_url: "https://openseauserdata.com/files/b261626a159edf64a8a92aa7306053b8.png", nbrFriends: 0 });
    const { username = '' } = useParams(); // Extract the username from the URL
    const totalGamesPlayed = userInfo.totalGamesWon + userInfo.totalGamesLost; //example
    const { user } = useAuth();
    const [newNickname, setNewNickname] = useState('');
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const navigate = useNavigate();
    const isOwner = user && user.username === username;
    const marginLeft = isOwner ? "150px" : "120px";

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`http://${server_adress}:3001/auth/user-info/${username}`, {
                    method: 'GET',
                    credentials: 'include'
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

    const changeNickname = async () => {
        if (!newNickname) {
            alert('Please enter a nickname.');
            return;
        }

        try {
            const response = await fetch(`http://${server_adress}:3001/auth/change-nickname`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newNickname })
            });

            console.log(response);
            if (response.ok) {
                navigate(`/@/${encodeURIComponent(newNickname)}`);
                setIsEditingNickname(false);
                setUserInfo((prev) => ({ ...prev, username: newNickname }));
            } else {
                const errorData = await response.json();
                alert(`Failed to change nickname: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error changing nickname:', error);
        }
    };

    const toggleTheme = () => {
        setTheme(prevTheme => {
            switch (prevTheme) {
                case 'bw-style':
                    return 'rainbow-style';
                case 'rainbow-style':
                    return 'retrowave-style';
                case 'retrowave-style':
                    return 'bw-style';
                default:
                    return 'bw-style';
            }
        });
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
        if (eloRating < 1000 || totalGamesPlayed === 0) {
            return 'just beginning';
        } else if (eloRating < 1010) {
            return 'getting there';
        } else if (eloRating < 1020) {
            return 'rock solid';
        } else if (eloRating < 1030) {
            return 'got swagger';
        } else if (eloRating < 1040) {
            return 'the hotness';
        } else if (eloRating < 1050) {
            return 'simply amazing';
        } else {
            return 'pinnacle of awesomeness';
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (user.username !== username) {
            alert("You can only change your own avatar.");
            return;
        }
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert("File is too big. Please select a file smaller than 2MB.");
                return;
            }

            const isValidFilename = validateFilename(file.name);
            if (!isValidFilename) {
                alert("Invalid filename. Please avoid spaces and special characters.");
                return;
            }

            // Upload the avatar and refresh user information when it's done
            uploadAvatar(file, username);
        }
    };

    const validateFilename = (filename: string): boolean => {
        // Define a regex pattern to match valid filenames (no spaces or special characters)
        const pattern = /^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9]+)?$/;
        return pattern.test(filename);
    };

    const uploadAvatar = async (file: File, username: string) => {
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('username', username);

        try {
            const response = await fetch(`http://${server_adress}:3001/auth/upload-avatar`, {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                setUserInfo((prevUserInfo) => ({
                    ...prevUserInfo,
                    img_url: data.fileUrl
                }));
                console.log(data.fileUrl);
            } else {
                console.error('Failed to upload avatar:', data.error);
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    };

    return (

        <div className="bruh">
            <head>
                <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
            </head>

            <body className={theme}>
                <div className="card">
                    <div className={`user-card ${theme}`}>
                        <div className="level">{getEloRank(+userInfo.eloRating)}</div>
                        <div className='profile-picture'>
                            <img
                                src={userInfo.img_url || "https://openseauserdata.com/files/b261626a159edf64a8a92aa7306053b8.png"}
                                className="rounded-image" width="135" height="135" alt="User avatar"
                                onClick={user && user.username === username ? (() => fileInputRef.current?.click()) : undefined}
                                style={{ cursor: user && user.username === username ? 'pointer' : 'default' }} />
                            <input
                                type="file" ref={fileInputRef} style={{ display: 'none' }}
                                accept=".png" onChange={handleAvatarChange} />
                        </div>
                        <div className="points">{userInfo.eloRating}</div>
                    </div>
                    <div className="more-info">
                        <div className='more-info-header'>
                            <h1>{userInfo.username}</h1>
                            {user && user.username === username && (
                                <button className="edit-profile-name" onClick={() => setIsEditingNickname(!isEditingNickname)}>
                                    <i className='bx bxs-pencil'></i>
                                </button>
                            )}
                            {isEditingNickname && (
                                <div className="edit-nickname-form">
                                    <input
                                        className='new-nickname-input'
                                        type="text"
                                        placeholder="Enter new nickname"
                                        value={newNickname}
                                        onChange={(e) => setNewNickname(e.target.value)}
                                    />
                                    <button className="submit-nickname-change" onClick={changeNickname}>
                                    <i className='bx bxs-save'></i>
                                    </button>
                                </div>
                            )}
                        </div>
                        <Link to={`/signout`} className="signout-button">
                            <i className='bx bx-exit'></i></Link>
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
                                <div className="value">{userInfo.nbrFriends}</div>
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
                        <Link to={`/@/${username}/match-history`} className="leaderboard-button" style={{ marginLeft: marginLeft }}>
                            Match History</Link>
                    </div>
                    {user && user.username === username && (
                        <div>
                            <Link to={`/2fa-enable`} className="twoFA-button twoFA-button-on">
                                2FA on</Link>
                            <Link to={`/2fa-disable`} className="twoFA-button twoFA-button-off">
                                2FA off</Link>
                        </div>
                    )}
                    {user && user.username === username && (
                        <button className="edit-profile" onClick={toggleTheme}>
                            <i className='bx bxs-palette'></i></button>
                    )}
                </div>
            </body>
        </div>
    );
}


export default Profile;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './UserLeaderboard.css'

interface LeaderboardEntry {
    username: string;
    eloRating: number;
    totalGamesWon: number;
    totalGamesLost: number;
    winPercentage: number;
}

function UserLeaderboard() {
    const [userRanking, setUserRanking] = useState<LeaderboardEntry[]>([]);
    const { username } = useParams();

    useEffect(() => {
        const fetchUserRanking = async () => {
            const response = await fetch(`http://localhost:3001/auth/leaderboard/${username}`);
            const data = await response.json();
            if (response.ok) {
                setUserRanking(data);
            } else {
                console.log("error in fetch user error")
                // Handle error
            }
        };

        if (username) {
            fetchUserRanking();
        }
    }, [username]);

    return (
        <div>
            <h1>{username}'s Leaderboard</h1>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Username</th>
                        <th>ELO Rating</th>
                        <th>Wins</th>
                        <th>Losses</th>
                        <th>Win %</th>
                    </tr>
                </thead>
                <tbody>
                    {userRanking.map((user, index) => (
                        <tr key={user.username} className={user.username === username ? 'highlight' : ''}>
                            <td>{index + 1}</td>
                            <td>{user.username}</td>
                            <td>{user.eloRating}</td>
                            <td>{user.totalGamesWon}</td>
                            <td>{user.totalGamesLost}</td>
                            <td>{user.winPercentage}%</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserLeaderboard;

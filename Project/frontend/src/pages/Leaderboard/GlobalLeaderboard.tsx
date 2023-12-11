import React, { useEffect, useState } from 'react';
import './GlobalLeaderboard.css'

interface LeaderboardEntry {
    username: string;
    eloRating: number;
    totalGamesWon: number;
    totalGamesLost: number;
    winPercentage: number;
}

function GlobalLeaderboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const response = await fetch('http://localhost:3001/auth/leaderboard');
            const data = await response.json();
            if (response.ok) {
                setLeaderboard(data);
            } else {
                // Handle error
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div>
            <h1>Global Leaderboard</h1>
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
                    {leaderboard.map((user, index) => (
                        <tr key={user.username}>
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

export default GlobalLeaderboard;

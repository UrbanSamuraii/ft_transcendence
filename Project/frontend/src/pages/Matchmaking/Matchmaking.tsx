import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matchmaking.css';
import { useSocket } from '../../SocketContext';

function Matchmaking() {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const matchFoundRef = useRef(false);
    const [ongoingGameId, setOngoingGameId] = useState(null);
    const [isGameStatusChecked, setIsGameStatusChecked] = useState(false);

    useEffect(() => {
        if (!socket) {
            console.log('No socket provided in Matchmaking page');
            return;
        }

        const handleGameStatusResponse = (data: any) => {
            if (data.inGame) {
                setOngoingGameId(data.gameId);
            } else {
                socket.emit('enterMatchmaking');
                socket.on('matchFound', handleMatchFound);
            }
            setIsGameStatusChecked(true); // Update when the check is complete
        };

        const handleMatchFound = (data: any) => {
            console.log('Match found!', data);
            navigate(`/game/${data.gameId}`);
            matchFoundRef.current = true;
        };

        socket.emit('checkGameStatus');
        socket.on('gameStatusResponse', handleGameStatusResponse);

        return () => {
            console.log("Matchmaking component is unmounting");
            socket.off('gameStatusResponse', handleGameStatusResponse);
            socket.off('matchFound', handleMatchFound);
            if (!matchFoundRef.current && ongoingGameId == null && isGameStatusChecked)
                socket.emit('leaveMatchmaking');
        };
    }, [socket]);

    const handleReconnectClick = () => {
        if (ongoingGameId) {
            navigate(`/game/${ongoingGameId}`);
        }
    };

    if (ongoingGameId) {
        return (
            <div className="reconnect-container">
                <button className="reconnect-button" onClick={handleReconnectClick}>
                    Reconnect to Game
                </button>
            </div>
        );
    }

    return (
        <div className="paddle-container">
            <div className="searching-text">Searching for a game...</div>
            <div className="paddle"></div>
            <div className="ball"></div>
            <div className="paddle"></div>
        </div>
    );
}

export default Matchmaking;

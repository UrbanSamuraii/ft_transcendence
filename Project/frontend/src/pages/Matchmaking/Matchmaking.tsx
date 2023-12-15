import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Matchmaking.css';
import { useSocket } from '../../SocketContext';

function Matchmaking() {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const matchFoundRef = useRef(false);
    const [ongoingGameId, setOngoingGameId] = useState(null);
    const [isGameStatusChecked, setIsGameStatusChecked] = useState(false);
    const isGameStatusCheckedRef = useRef(isGameStatusChecked);
    const ongoingGameIdRef = useRef(ongoingGameId);
    const { gameMode, champion } = location.state || { gameMode: 'classic', champion: null };

    useEffect(() => {
        if (!socket) {
            console.log('No socket provided in Matchmaking page');
            return;
        }

        const handleGameStatusResponse = (data: any) => {
            socket.off('gameStatusResponse');
            if (data.inGame) {
                setOngoingGameId(data.gameId);
                ongoingGameIdRef.current = data.gameId;
            } else {
                console.log(`Emitting enterMatchmaking for ${gameMode} mode`);
                // socket.emit('enterMatchmaking');
                socket.emit('enterMatchmaking', { gameMode, championId: champion?.id });
                socket.on('matchFound', handleMatchFound);
            }
            setIsGameStatusChecked(true); // Update when the check is complete
            isGameStatusCheckedRef.current = true;
            console.log("isGameStatusChecked: ", isGameStatusChecked);
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
            console.log("matchFoundRef.current:", matchFoundRef.current);
            console.log("ongoingGameId:", ongoingGameId);
            console.log("isGameStatusChecked:", isGameStatusChecked);

            if (!matchFoundRef.current && ongoingGameIdRef.current == null && isGameStatusCheckedRef.current) {
                console.log("Emitting leaveMatchmaking");
                socket.emit('leaveMatchmaking');
            }
        };

    }, []);

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

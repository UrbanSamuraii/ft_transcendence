import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';
import './SelectMode.css';

interface Champion {
    name: string;
    specialAbility: string;
}

const SelectModePage = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [ongoingGameId, setOngoingGameId] = useState(null);
    const [gameMode, setGameMode] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // New loading state

    useEffect(() => {
        if (!socket) {
            console.error('Socket is not available');
            setIsLoading(false); // Set loading to false if socket is not available
            return;
        }

        setIsLoading(true); // Start loading before emitting 'checkGameStatus'
        socket.emit('checkGameStatus');

        const handleGameStatusResponse = (data: any) => {
            if (data.inGame) {
                setOngoingGameId(data.gameId);
                setGameMode(data.gameMode);
            }
            setIsLoading(false); // Stop loading after receiving the response
        };

        socket.on('gameStatusResponse', handleGameStatusResponse);

        return () => {
            socket.off('gameStatusResponse', handleGameStatusResponse);
        };
    }, [socket]);

    const handleClassicModeClick = () => {
        navigate('/matchmaking', { state: { gameMode: 'classic' } });
    };

    const handlePowerPongModeClick = () => {
        navigate('/matchmaking', { state: { gameMode: 'powerpong' } });
    };

    const handleReconnectClick = () => {
        if (ongoingGameId) {
            const gameModePath = gameMode === 'powerpong' ? '/powerpong/' : '/classic/';
            navigate(`${gameModePath}${ongoingGameId}`);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>; // Or your custom loading indicator
    }

    return (
        <div className="mode-selection">
            {!ongoingGameId && (
                <>
                    <button className="mode-button classic-mode" onClick={handleClassicModeClick}>CLASSIC</button>
                    <button className="mode-button power-pong-mode" onClick={handlePowerPongModeClick}>POWER PONG</button>
                </>
            )}
            {ongoingGameId && (
                <button className="mode-button reconnect-button" onClick={handleReconnectClick}>RECONNECT</button>
            )}
        </div>
    );
};

export default SelectModePage;

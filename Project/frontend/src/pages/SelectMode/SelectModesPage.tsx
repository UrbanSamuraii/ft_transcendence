import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';

const SelectModePage = () => {
    const navigate = useNavigate();
    const { socket } = useSocket(); // Assuming you have a SocketContext
    const [ongoingGameId, setOngoingGameId] = useState(null);

    useEffect(() => {
        if (!socket) {
            console.error('Socket is not available');
            return;
        }

        socket.emit('checkGameStatus');

        const handleGameStatusResponse = (data: any) => {
            if (data.inGame) {
                setOngoingGameId(data.gameId);
            }
        };

        socket.on('gameStatusResponse', handleGameStatusResponse); // Update 'gameStatusResponse' with the actual event name used in your backend

        return () => {
            socket.off('gameStatusResponse', handleGameStatusResponse);
        };
    }, [socket]);

    const handleClassicModeClick = () => {
        navigate('/matchmaking');
    };

    const handleReconnectClick = () => {
        if (ongoingGameId) {
            navigate(`/game/${ongoingGameId}`);
        }
    };

    return (
        <div className="mode-selection">
            <button className="mode-button classic-mode" onClick={handleClassicModeClick}>CLASSIC</button>
            {ongoingGameId && (
                <button className="mode-button reconnect-button" onClick={handleReconnectClick}>RECONNECT</button>
            )}
            {/* Other buttons */}
        </div>
    );
};

export default SelectModePage;

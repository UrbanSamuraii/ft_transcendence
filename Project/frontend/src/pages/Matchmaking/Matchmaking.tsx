import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matchmaking.css';
import { useSocket } from './SocketContext';

function Matchmaking() {
    console.log("Matchmaking component rendered/mounted\n");

    const { socket, startSocketConnection } = useSocket();
    const navigate = useNavigate();
    const hasAddedListeners = useRef(false);  // To track if listeners have been added

    useEffect(() => {
        startSocketConnection();

        if (socket && !hasAddedListeners.current) {
            const handleMatchFound = (data: any) => {
                console.log('Match found!', data);
                navigate("/game");
            };
            socket.on('matchFound', handleMatchFound);
            hasAddedListeners.current = true;  // Set the ref to true after adding the listeners

            return () => {
                socket.off('matchFound', handleMatchFound);
                hasAddedListeners.current = false;  // Reset the ref during cleanup
            };
        }
    }, [socket]);

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

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Matchmaking.css';
import { useSocket } from './SocketContext';

function Matchmaking() {
    console.log("Matchmaking component rendered/mounted\n");

    const { socket, startSocketConnection, stopSocketConnection } = useSocket();
    const navigate = useNavigate();
    const matchFoundRef = useRef(false);
    const hasAddedListeners = useRef(false); // To track if listeners have been added, 
    // When a component re-renders, there's a risk that it might add another 
    // set of listeners to the same socket connection without removing the previous
    // ones. This can lead to multiple event handlers for the same event, causing 
    // the handler function to execute multiple times for a single event.

    useEffect(() => {
        startSocketConnection();

        console.log(socket);
        console.log(hasAddedListeners.current);
        if (socket && !hasAddedListeners.current) {
            const handleMatchFound = (data: any) => {
                console.log('Match found!', data);
                matchFoundRef.current = true;
                navigate("/game");
            };
            socket.on('matchFound', handleMatchFound);
            hasAddedListeners.current = true;  // Set the ref to true after adding the listeners

            return () => {
                socket.off('matchFound', handleMatchFound);
                if (socket && !matchFoundRef.current) {
                    socket.emit('leaveMatchmaking'); // Emit event when leaving the page
                }
                hasAddedListeners.current = false;  // Reset the ref during cleanup
            };
        }
    }, [socket, matchFoundRef.current]);

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

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import './Matchmaking.css';

function Matchmaking() {
    const navigate = useNavigate();

    useEffect(() => {
        const serverAddress = window.location.hostname === 'localhost' ?
            'http://localhost:3002' :
            `http://${window.location.hostname}:3002`;

        const socketConnection = io(serverAddress, {
            withCredentials: true
        });

        socketConnection.on('matchFound', (data: any) => {
            console.log('Match found!', data);
            // navigate("/game");  // Navigate to the game when a match is found
            navigate("/game", { state: { socket: socketConnection } });
        });

        return () => {
            socketConnection.close();
        };
    }, [navigate]);

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
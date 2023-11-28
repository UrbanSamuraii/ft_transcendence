import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matchmaking.css';
import { useSocket } from '../../SocketContext';

function Matchmaking() {
    const { socket } = useSocket();
    const navigate = useNavigate();
    const matchFoundRef = useRef(false);
    console.log("Matchmaking component mounted/re-rendered");

    useEffect(() => {
        if (!socket) {
            console.log('No socket provided in Matchmaking page');
            return;
        }

        const handleMatchFound = (data: any) => {
            console.log('Match found!', data);
            navigate(`/game/${data.gameId}`);
            matchFoundRef.current = true;
        };

        // Emit 'enterMatchmaking' if already connected
        if (socket.connected) {
            console.log("Socket already connected, emitting 'enterMatchmaking'");
            socket.emit('enterMatchmaking');
        } else {
            socket.on('connect', () => {
                console.log("Connected, socket id:", socket.id);
                socket.emit('enterMatchmaking');
            });
        }

        socket.on('matchFound', handleMatchFound);

        return () => {
            console.log("Matchmaking component is unmounting");
            socket.off('matchFound', handleMatchFound);
            socket.off('connect');
            if (!matchFoundRef.current)
                socket.emit('leaveMatchmaking');
        };
    }, [socket, navigate]);

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

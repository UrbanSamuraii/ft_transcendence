import React, { createContext, useState, useContext, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

type SocketContextType = {
    socket: Socket | null;
    startSocketConnection: () => void;
    stopSocketConnection: () => void;
};

const SocketContext = createContext<SocketContextType | null>(null);

type SocketProviderProps = {
    children: React.ReactNode;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null);  // Create a ref to hold the socket connection

    const startSocketConnection = () => {
        if (!socketRef.current) {  // Check if the socket ref is empty
            const serverAddress = window.location.hostname === 'localhost' ?
                'http://localhost:3002' :
                `http://${window.location.hostname}:3002`;

            const socketConnection = io(serverAddress, {
                withCredentials: true
            });

            socketConnection.on('matchFound', (data) => {
                console.log('Match found!', data);
            });

            socketRef.current = socketConnection;  // Store the socket connection in the ref
        }
    };

    const stopSocketConnection = () => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    };

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, startSocketConnection, stopSocketConnection }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === null) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

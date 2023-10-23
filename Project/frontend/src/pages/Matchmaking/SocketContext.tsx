import React, { createContext, useState, useContext } from 'react';
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
    const [socket, setSocket] = useState<Socket | null>(null);

    const startSocketConnection = () => {
        if (!socket) {
            const serverAddress = window.location.hostname === 'localhost' ?
                'http://localhost:3002' :
                `http://${window.location.hostname}:3002`;

            const socketConnection = io(serverAddress, {
                withCredentials: true
            });

            socketConnection.on('matchFound', (data) => {
                console.log('Match found!', data);
                // Handle the logic when a match is found
            });

            setSocket(socketConnection);
        }
    };

    const stopSocketConnection = () => {
        if (socket) {
            socket.close();
            setSocket(null);
        }
    };

    return (
        <SocketContext.Provider value={{ socket, startSocketConnection, stopSocketConnection }}>
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

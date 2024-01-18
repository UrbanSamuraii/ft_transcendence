import React, { createContext, useState, useContext, useRef, Dispatch, SetStateAction, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

type SocketContextType = {
    socket: Socket | null;
    isLastMessageDeleted: boolean;
    setLastMessageDeleted: Dispatch<SetStateAction<boolean>>;
    conversationId: number | null,
    setConversationId: Dispatch<SetStateAction<number | null>>;
};

type SocketProviderProps = {
    children: React.ReactNode;
};

export const SocketContext = createContext<SocketContextType | null>(null);

export const OnlySocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

    console.log("In Only Socket Provider");
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isLastMessageDeleted, setLastMessageDeleted] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);
    const [reinitializeSocket, setReinitializeSocket] = useState(false);

    // const serverAddress = process.env.REACT_APP_SERVER_ADRESS;
    const serverAddress = `http://${process.env.REACT_APP_SERVER_ADRESS}:3001`;
    // const serverAddress = window.location.hostname === 'localhost' ?
    //     'http://localhost:3001' :
    //     `http://${server_adress}:3001`;

    useEffect(() => {
        const socketConnection = io(serverAddress, { withCredentials: true });
        setSocket(socketConnection);

        socketConnection.on('disconnect', (reason) => {
            console.log("Socket disconnected, reason:", reason);
            if (reason === "io server disconnect" || reason === "io client disconnect") {
                console.log('Triggering socket reinitialization...');
                setReinitializeSocket(prev => !prev); // Toggle to trigger useEffect
            } else {
                console.log("Socket disconnected... attempting to reconnect");
            }
        });



        return () => {
            socketConnection.disconnect();
        };
    }, [reinitializeSocket]); // Depend on reinitializeSocket state


    return (
        <SocketContext.Provider
            value={{
                socket,
                isLastMessageDeleted,
                setLastMessageDeleted,
                conversationId,
                setConversationId,
            }}
        >
            {children}
        </SocketContext.Provider>
    );
}

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === null) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
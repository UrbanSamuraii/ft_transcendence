import React, { createContext, useState, useContext, useRef, Dispatch, SetStateAction, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

type SocketContextType = {
    socket: Socket | null;
    // disconnectAndReconnect: () => void;
    newMessageReceived: boolean;
    setNewMessageReceived: Dispatch<SetStateAction<boolean>>;
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
    const [newMessageReceived, setNewMessageReceived] = useState(false);
    const [isLastMessageDeleted, setLastMessageDeleted] = useState(false);
    const [conversationId, setConversationId] = useState<number | null>(null);

    const serverAddress = window.location.hostname === 'localhost' ?
        'http://localhost:3001' :
        `http://${window.location.hostname}:3001`;

    useEffect(() => {
        const socketConnection = io(serverAddress, {
            withCredentials: true
        });
        setSocket(socketConnection);

        socketConnection.on('disconnect', (reason) => {
            // Logic to handle reconnection
            if (reason === "io server disconnect") {
                console.log('Socket manually disconnected, attempting to reconnect...');
                // the disconnection was initiated by the server, you need to reconnect manually
                const newSocketConnection = io(serverAddress, {
                    withCredentials: true
                });
                setSocket(newSocketConnection);
            }
            else
                console.log("socket disconnected... attempting to reconnect");
        });

        // Cleanup function to disconnect socket when the component unmounts
        return () => {
            socketConnection.disconnect();
        };
    }, []);

    // const disconnectAndReconnect = (currentSocket?: Socket) => {
    //     if (currentSocket) {
    //         console.log({"Socket Disconnected -> Ready To Get A New One": socket?.id});
    //         currentSocket.disconnect();
    //     }

    //     const newSocketConnection = io(serverAddress, {
    //         withCredentials: true
    //     });

    //     console.log({"New Socket after Deconnection": newSocketConnection?.id});
    //     setSocket(newSocketConnection);
    // };


    return (
        <SocketContext.Provider
            value={{
                socket,
                // disconnectAndReconnect: () => disconnectAndReconnect(socket!),
                newMessageReceived,
                setNewMessageReceived,
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
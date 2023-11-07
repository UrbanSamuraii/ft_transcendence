import { createContext, useState, ReactNode,  Dispatch, SetStateAction } from 'react';
import { io, Socket } from 'socket.io-client';

type chatSocketContextType = {
    chatSocket: Socket | null;
    newMessageReceived: boolean;
    setNewMessageReceived: Dispatch<SetStateAction<boolean>>;
};

type chatSocketProviderProps = {
    children: ReactNode;
};

export const chatSocketContext = createContext<chatSocketContextType | null>(null);

const serverAddress = window.location.hostname === 'localhost' ?
                'http://localhost:3001' :
                `http://${window.location.hostname}:3001`;

export const chatSocket = io(serverAddress, {
	withCredentials: true
});

export const ChatSocketProvider : React.FC<chatSocketProviderProps> = ({ children }) => {
    const [newMessageReceived, setNewMessageReceived] = useState(false);

    return (
        <chatSocketContext.Provider value={{ chatSocket, newMessageReceived, setNewMessageReceived }}>
          {children}
        </chatSocketContext.Provider>
      );
};
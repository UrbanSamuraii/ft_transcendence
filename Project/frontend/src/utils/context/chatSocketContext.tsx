import { createContext, useState, ReactNode,  Dispatch, SetStateAction, useRef, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

type chatSocketContextType = {
    chatSocket: Socket | null;
    newMessageReceived: boolean;
    setNewMessageReceived: Dispatch<SetStateAction<boolean>>;
    startChatSocketConnection: () => void;
    stopChatSocketConnection: () => void;
};

type chatSocketProviderProps = {
    children: ReactNode;
};

export const chatSocketContext = createContext<chatSocketContextType | null>(null);

// const serverAddress = window.location.hostname === 'localhost' ?
//                 'http://localhost:3001' :
//                 `http://${window.location.hostname}:3001`;

// export const chatSocket = io(serverAddress, {
// 	withCredentials: true
// });

export const ChatSocketProvider : React.FC<chatSocketProviderProps> = ({ children }) => {
    
  const chatSocketRef = useRef<Socket | null>(null);
    const [newMessageReceived, setNewMessageReceived] = useState(false);

    const startChatSocketConnection = () => {
      if (!chatSocketRef.current) {
          const serverAddress = window.location.hostname === 'localhost' ?
              'http://localhost:3001' :
              `http://${window.location.hostname}:3001`;

              const chatSocket = io(serverAddress, {
                withCredentials: true
              });

              chatSocketRef.current = chatSocket;  // Store the socket connection in the ref
        }
    };

    const stopChatSocketConnection = () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.close();
        chatSocketRef.current = null;
      }
  };

    return (
        <chatSocketContext.Provider value={{ chatSocket: chatSocketRef.current, newMessageReceived, setNewMessageReceived, startChatSocketConnection, stopChatSocketConnection }}>
          {children}
        </chatSocketContext.Provider>
    );
};

export const useChatSocket = () => {
  const context = useContext(chatSocketContext);
  if (context === null) {
      throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
import { createContext } from 'react';
import { io } from 'socket.io-client';

const serverAddress = window.location.hostname === 'localhost' ?
                'http://localhost:3001' :
                `http://${window.location.hostname}:3001`;

export const chatSocket = io(serverAddress, {
	withCredentials: true
});

export const chatSocketContext = createContext(chatSocket);
// import React, { useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import './Matchmaking.css';
// import { useSocket } from './SocketContext';

// function Matchmaking() {
//     console.log("Matchmaking component re-renders/is mounted\n");

//     const { socket, startSocketConnection } = useSocket();
//     const navigate = useNavigate();
//     const matchFoundRef = useRef(false);
//     const hasAddedListeners = useRef(false); // To track if listeners have been added, 
//     // When a component re-renders, there's a risk that it might add another 
//     // set of listeners to the same socket connection without removing the previous
//     // ones. This can lead to multiple event handlers for the same event, causing 
//     // the handler function to execute multiple times for a single event.
//     const isMountedRef = useRef(true);


//     useEffect(() => {
//         return () => {
//             isMountedRef.current = false;
//             console.log("Matchmaking component is unmounted");
//         };
//     }, []);

//     useEffect(() => {
//         startSocketConnection();

//         console.log("clopd:", hasAddedListeners.current);
//         console.log("cicif: socket:", socket);
//         if (socket) {
//             socket.on('connect', () => {
//                 console.log("Connected, socket id:", socket.id);
//             });
//         }
//         if (socket && !hasAddedListeners.current) {
//             console.log("cicif: socketID:", socket.id);
//             console.log("gigaCLAP");

//             const handleMatchFound = (data: any) => {
//                 console.log('Match found!', data);
//                 matchFoundRef.current = true;
//                 console.log("clpp:", `/game/${data.gameId}`);
//                 navigate(`/game/${data.gameId}`); // Navigate to the game route with the game ID
//                 socket.emit('playerReady');
//             };
//             socket.on('matchFound', handleMatchFound);
//             hasAddedListeners.current = true;  // Set the ref to true after adding the listeners
//         }
//         return () => {
//             console.log("return of matchmaking useeffect triggered");
//             if (!isMountedRef.current) {
//                 // Only remove the listener if the component is unmounting
//                 if (socket) {
//                     console.log("we are killing the listener for matchFound on socket:", socket);
//                     // socket.off('matchFound', handleMatchFound);
//                 }
//             }
//             // socket.off('matchFound', handleMatchFound);

//             console.log("Before emitting leaveMatchmaking as component is unmounting");

//             if (socket && !matchFoundRef.current) {
//                 console.log("Emitting leaveMatchmaking as component is unmounting");
//                 socket.emit('leaveMatchmaking'); // Emit event when leaving the page
//             }
//             // matchFoundRef.current = false;
//             // hasAddedListeners.current = false;  // Reset the ref during cleanup
//         };
//     }, [socket, navigate, startSocketConnection]);



//     return (
//         <div className="paddle-container">
//             <div className="searching-text">Searching for a game...</div>
//             <div className="paddle"></div>
//             <div className="ball"></div>
//             <div className="paddle"></div>
//         </div>
//     );
// }

// export default Matchmaking;


import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matchmaking.css';
import { useSocket } from './SocketContext';

function Matchmaking() {
    const { socket, startSocketConnection } = useSocket();
    const navigate = useNavigate();
    const matchFoundRef = useRef(false);
    console.log("Matchmaking component re-renders/is mounted\n");

    useEffect(() => {
        startSocketConnection();

        const handleMatchFound = (data: any) => {
            console.log('Match found!', data);
            navigate(`/game/${data.gameId}`);
            matchFoundRef.current = true;
        };

        console.log(socket)
        if (socket) {
            console.log("yeah", socket)
            console.log("yeah", socket.id)
            socket.on('connect', () => {
                console.log("yeahI AM CONNECTED", socket)
                console.log("Connected, socket id:", socket.id);
            });
            socket.on('matchFound', handleMatchFound);
        }

        return () => {
            console.log("Matchmaking component is unmounting");
            if (socket) {
                socket.off('matchFound', handleMatchFound);
                if (!matchFoundRef.current)
                    socket.emit('leaveMatchmaking');
            }
        };
    }, [socket, navigate, startSocketConnection]);

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

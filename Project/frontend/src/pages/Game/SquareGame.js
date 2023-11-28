import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
// import React, { useState, useEffect } from 'react';
import './SquareGame.css';
import { drawGrid } from '../../Utils.js';
import { getCookie } from '../../utils/cookies'
import { useSocket } from '../../SocketContext';  // Update the path accordingly if needed
import { useNavigate, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const targetAspectRatio = 1318 / 807;
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 945;
const TARGET_WIDTH = 1318;
const TARGET_HEIGHT = 807;

const widthRatio = TARGET_WIDTH / BASE_WIDTH;
const heightRatio = TARGET_HEIGHT / BASE_HEIGHT;

function SquareGame({ }) {
    const canvasRef = useRef(null);
    const [gameData, setGameData] = useState(null);
    const [activeKeys, setActiveKeys] = useState([]);
    const activeKeysRef = useRef(activeKeys);  // useRef to hold activeKeys
    const [isGamePaused, setGamePaused] = useState(false);
    const { socket } = useSocket();  // Get the socket from context
    const { id: gameId } = useParams(); // Get the game ID from the URL
    const navigate = useNavigate();
    const [intervalId, setIntervalId] = useState(null);
    const lastSentWasEmptyRef = useRef(true);

    // Update the interval based on active keys
    useEffect(() => {
        activeKeysRef.current = activeKeys;

        // if (activeKeys.length > 0) {
        //     startInterval();
        // } else {
        //     stopInterval();
        // }
    }, [activeKeys]);

    function goBackToMainMenu() {
        navigate("/");
    }

    function goBackToMatchmaking() {
        navigate("/matchmaking");
    }

    useEffect(() => {
        if (!socket) return;

        const handleGameDataUpdate = (data) => {
            setGameData(data);
            drawGame(data);

            if (data.isGameOver) {
                clearInterval(intervalId);
            }
        };

        socket.on("updateGameData", handleGameDataUpdate);

        // A single interval is set up and maintained
        const intervalId = setInterval(() => {
            const currentKeys = activeKeysRef.current;
            if (currentKeys.length > 0) {
                socket.emit('paddleMovements', currentKeys);
                lastSentWasEmptyRef.current = false;
            } else if (!lastSentWasEmptyRef.current) {
                socket.emit('paddleMovements', []);
                lastSentWasEmptyRef.current = true;
            }
        }, 1000 / 60);

        return () => {
            clearInterval(intervalId);
            socket.off("updateGameData", handleGameDataUpdate);
        };
    }, [socket, gameId]);

    useEffect(() => {
        const handleKeyDown = (event) => {

            console.log(`Key down: ${event.key}`);

            switch (event.key) {
                case "w":
                case "s":
                case "ArrowUp":
                case "ArrowDown":
                    if (!activeKeys.includes(event.key)) {
                        setActiveKeys(prevKeys => [...prevKeys, event.key]);
                    }
                    break;
                case "p":
                case "P":
                    if (isGamePaused) {
                        // Resume the game
                        setGamePaused(false);
                        socket.emit('resumeGame'); // Inform backend to resume sending updates
                    } else {
                        // Pause the game
                        setGamePaused(true);
                        socket.emit('pauseGame'); // Inform backend to pause sending updates
                    }
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event) => {

            console.log(`Key up: ${event.key}`);

            switch (event.key) {
                case "w":
                case "s":
                case "ArrowUp":
                case "ArrowDown":
                    setActiveKeys(prevKeys => prevKeys.filter(key => key !== event.key));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [activeKeys, isGamePaused]);


    const drawButton = (x, y, width, height, text, callback) => {
        console.log(`Drawing button with text: ${text}`);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const borderThickness = width / 50; // Adjust the divisor to achieve desired scaling. 
        ctx.lineWidth = borderThickness;

        ctx.fillStyle = '#0d0d0e';
        ctx.fillRect(x, y, width, height);

        // Draw the button's white outline
        ctx.strokeStyle = '#FFF';
        ctx.strokeRect(x, y, width, height);

        // Adjust font size based on button width (e.g., width / 10 gives 10% of button width)
        const fontSize = width / 7;

        ctx.fillStyle = '#ffffff';
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';

        // Adjust vertical positioning based on the fontSize
        ctx.fillText(text, x + width / 2, y + height / 2 + fontSize / 4);

        // Store callback and button bounds for click detection
        buttons.push({
            x, y, width, height, callback
        });
    }

    const buttons = [];

    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Check if click is inside any button
        for (let btn of buttons) {
            if (mouseX > btn.x && mouseX < btn.x + btn.width && mouseY > btn.y && mouseY < btn.y + btn.height) {
                console.log(`Clicked on button: ${btn.text}`);
                btn.callback();
                break;
            }
        }
    }

    const drawNet = (data) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const numberOfSquares = 15; // Adjust this number as per your requirement

        const canvasAspectRatio = canvas.width / canvas.height;
        let gameWidth, gameHeight;
        if (canvasAspectRatio > targetAspectRatio) {
            gameHeight = canvas.height;
            gameWidth = gameHeight * targetAspectRatio;
        } else {
            gameWidth = canvas.width;
            gameHeight = gameWidth / targetAspectRatio;
        }
        const offsetX = (canvas.width - gameWidth) / 2;
        const offsetY = (canvas.height - gameHeight) / 2;

        const pixelSize = data.squares[0].size * gameWidth / 100; // Assuming the first square in data.squares is representative

        const gap = pixelSize; // Setting the gap equal to the pixelSize for even spacing

        ctx.fillStyle = 'white';

        for (let i = 0; i < numberOfSquares; i++) {
            // const x = offsetX + (gameWidth.width / 2) - (pixelSize / 2); // Center it
            const x = offsetX + (gameWidth / 2) - (pixelSize / 2); // Center it within the game area
            // const x = offsetX + (canvas.width / 2) - (pixelSize / 2); // Center it
            const y = offsetY + i * (pixelSize + gap);
            ctx.fillRect(x, y, pixelSize, pixelSize);
        }
    }

    const drawGame = (data) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

        const canvasAspectRatio = canvas.width / canvas.height;

        let gameWidth, gameHeight;

        if (canvasAspectRatio > targetAspectRatio) {
            gameHeight = canvas.height;
            gameWidth = gameHeight * targetAspectRatio;
        } else {
            gameWidth = canvas.width;
            gameHeight = gameWidth / targetAspectRatio;
        }

        const offsetX = (canvas.width - gameWidth) / 2;
        const offsetY = (canvas.height - gameHeight) / 2;

        // Draw squares
        data.squares.forEach(square => {
            const pixelX = offsetX + square.x * gameWidth / 100;
            const pixelY = offsetY + square.y * gameHeight / 100;
            const pixelSize = square.size * gameWidth / 100; // Assuming square sizes are relative to width
            const pixelSize2 = square.size * gameWidth / 100; // Assuming square sizes are relative to width
            ctx.fillStyle = "white";
            ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize2);
        });

        // Draw paddles
        ['leftPaddle', 'rightPaddle'].forEach(paddleName => {
            const paddle = data[paddleName];
            const pixelX = offsetX + paddle.x * gameWidth / 100;
            const pixelY = offsetY + paddle.y * gameHeight / 100;
            const pixelWidth = paddle.width * gameWidth / 100;
            const pixelHeight = paddle.height * gameHeight / 100;
            ctx.fillRect(pixelX, pixelY, pixelWidth, pixelHeight);
        });

        // console.log("cl17: ", data.isGameOver)
        // console.log("cl18: ", data.winnerUsername)
        if (data.isGameOver) {
            // Constants for layout
            const buttonWidth = gameWidth * 0.3;
            const buttonHeight = gameHeight * 0.1;
            const winnerNameFontSize = gameHeight * 0.06;
            const buttonOffsetY = gameHeight * 0.6;
            const textOffsetY = buttonOffsetY - winnerNameFontSize * 2;

            // Determine the winner's side for X positioning
            const winnerSideX = data.leftScore > data.rightScore ? gameWidth * 0.25 : gameWidth * 0.75;

            // Set up font and style for the winner's name
            ctx.font = `${winnerNameFontSize}px 'Press Start 2P', cursive`;
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';

            // Calculate positions based on winner's side
            const textX = offsetX + winnerSideX;
            const buttonX = textX - buttonWidth / 2; // Center the button on the winner's side

            // Draw winner message
            ctx.fillText(`Winner: ${data.winnerUsername}`, textX, offsetY + textOffsetY);

            // Draw buttons
            drawButton(buttonX, offsetY + buttonOffsetY, buttonWidth, buttonHeight, 'MAIN MENU', goBackToMainMenu);
            drawButton(buttonX, offsetY + buttonOffsetY + buttonHeight * 1.5, buttonWidth, buttonHeight, 'PLAY AGAIN', goBackToMatchmaking);

            // Other game over logic
            console.log('Game over detected.');
        }


        drawNet(data);

        const fontSize = 100 * gameWidth / 1920; // Adjust font size based on gameWidth
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = '#ffffff';  // Resetting fill color for score
        ctx.textAlign = 'center';  // Resetting text alignment for score

        ctx.fillText(data.leftScore, offsetX + 0.25 * gameWidth, offsetY + fontSize);
        ctx.fillText(data.rightScore, offsetX + 0.75 * gameWidth, offsetY + fontSize);

    }

    useEffect(() => {
        const canvas = canvasRef.current;

        function handleResize() {
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 50;

            let containerWidth = window.innerWidth;
            let containerHeight = window.innerHeight - navbarHeight;

            let newCanvasWidth, newCanvasHeight;

            if (containerWidth <= 500 && containerHeight <= 440 - navbarHeight) {
                // Set canvas to exact appearance at 500x440px
                newCanvasWidth = 500;
                newCanvasHeight = 440;
            } else {
                if (containerWidth / containerHeight < TARGET_WIDTH / TARGET_HEIGHT) {
                    newCanvasHeight = Math.min(containerHeight, TARGET_HEIGHT);
                    newCanvasWidth = newCanvasHeight * (TARGET_WIDTH / TARGET_HEIGHT);
                } else {
                    newCanvasWidth = Math.min(containerWidth, TARGET_WIDTH);
                    newCanvasHeight = newCanvasWidth / (TARGET_WIDTH / TARGET_HEIGHT);
                }
            }

            // Ensure the canvas doesn't exceed the container's dimensions or its original size
            newCanvasWidth = Math.min(newCanvasWidth, TARGET_WIDTH, containerWidth);
            newCanvasHeight = Math.min(newCanvasHeight, TARGET_HEIGHT, containerHeight - navbarHeight);

            canvas.width = newCanvasWidth;
            canvas.height = newCanvasHeight;

            if (gameData) {
                drawGame(gameData);
            }
        }

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [gameData]);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.addEventListener('click', handleCanvasClick);

        return () => {
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [buttons]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            position: 'relative'
        }}>
            <canvas ref={canvasRef} style={{ backgroundColor: '#0d0d0e', position: 'absolute' }} />
        </div>
    );


}
export default SquareGame;

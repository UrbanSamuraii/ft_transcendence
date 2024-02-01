import { useState, useEffect, useRef, useCallback } from 'react';
import './PowerPongGame.css';
// import { drawGrid } from '../../Utils.js';
import { getCookie } from '../../utils/cookies'
import { useSocket } from '../../SocketContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const targetAspectRatio = 1318 / 807;
const TARGET_WIDTH = 1318;
const TARGET_HEIGHT = 807;

interface Power {
    type: string;
    specialAbility: string;
}

function PowerPongGame({ }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [activeKeys, setActiveKeys] = useState<string[]>([]);
    const activeKeysRef = useRef<string[]>(activeKeys);
    const [isGamePaused, setGamePaused] = useState(false);
    const { socket } = useSocket();
    const { id: gameId } = useParams<{ id: string }>(); // Specify type for useParams
    const navigate = useNavigate();
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
    const lastSentWasEmptyRef = useRef(true);
    const { user } = useAuth();
    const [gameData, setGameData] = useState(null);
    const [powerBarLevel, setPowerBarLevel] = useState(0); // State to track the power bar level
    const [currentPower, setCurrentPower] = useState<Power | null>(null); // State to track the current power
    const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(true);

    const powers: Power[] = [
        { type: 'Expand', specialAbility: 'Expand' },
        { type: 'SpeedBoost', specialAbility: 'SpeedBoost' },
        { type: 'MultiBall', specialAbility: 'MultiBall' },
    ];

    // Update the interval based on active keys
    useEffect(() => {
        activeKeysRef.current = activeKeys;

    }, [activeKeys]);

    function goBackToMainMenu() {
        navigate("/");
    }

    function goBackToSelectMode() {
        navigate("/select-mode");
    }

    useEffect(() => {
        if (!socket) return;

        const handleGameDataUpdate = (data: any) => {
            if (!user)
                return;
            // setIsPowerSelectionActive(false);
            setIsWaitingForPlayer(false);
            setGameData(data);
            if (data.leftPlayerInfo && data.leftPlayerInfo.username === user.username) {
                setPowerBarLevel(data.leftPlayerInfo.powerBarLevel);
                setCurrentPower(data.leftPlayerInfo.currentPower)
                console.log(`powerBarLevel: ${powerBarLevel}`);
            } else if (data.rightPlayerInfo && data.rightPlayerInfo.username === user.username) {
                setPowerBarLevel(data.rightPlayerInfo.powerBarLevel);
                setCurrentPower(data.rightPlayerInfo.currentPower)
                console.log(`powerBarLevel: ${powerBarLevel}`);
            }
            drawGame(data);
            if (data.isGameOver) {
                clearInterval(intervalId);
            }
            console.log(`username :  ${user.username}`)
            console.log(`data.leftPlayerInfo.username :  ${data.leftPlayerInfo.username}`)
            console.log(`data.rightPlayerInfo.username :  ${data.rightPlayerInfo.username}`)
        };
        // setPowerSelectionTimer(10);

        socket.emit("attemptReconnect", { username: getCookie("username"), gameId });

        socket.on("updateGameData", handleGameDataUpdate);
        // A single interval is set up and maintained
        const intervalId = setInterval(() => {
            const currentKeys = activeKeysRef.current;
            if (currentKeys.length > 0) {
                socket.emit('playerActions', currentKeys);
                lastSentWasEmptyRef.current = false;
            } else if (!lastSentWasEmptyRef.current) {
                socket.emit('playerActions', []);
                lastSentWasEmptyRef.current = true;
            }
        }, 1000 / 60);

        return () => {
            clearInterval(intervalId);
            socket.off("updateGameData", handleGameDataUpdate);
            socket.off('initiatePowerSelection');
            // setIsPowerSelectionActive(false);
            // setSelectedPower(null);
        };
    }, [socket, gameId]);


    useEffect(() => {
        const handleKeyDown = (event: any) => {
            console.log(`Key down: ${event.key}`);

            // Adding spacebar to the switch case
            switch (event.key) {
                case "w":
                case "s":
                case "ArrowUp":
                case "ArrowDown":
                case " ": // Spacebar
                    if (!activeKeys.includes(event.key)) {
                        setActiveKeys(prevKeys => [...prevKeys, event.key]);
                    }
                    break;
                case "p":
                case "P":
                    // Existing pause game logic
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (event: any) => {
            // Adding spacebar to the switch case
            switch (event.key) {
                case "w":
                case "s":
                case "ArrowUp":
                case "ArrowDown":
                case " ": // Spacebar
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

    // const buttons: any = [];
    const buttonsRef = useRef<any[]>([]);

    const drawButton = (x: number, y: number, width: number, height: number, text: string, callback: () => void) => {
        console.log(`Drawing button with text: ${text}`);

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas?.getContext('2d');
        if (!ctx) return; // Check if ctx is not null

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
        buttonsRef.current.push({
            x, y, width, height, callback, text
        });
    }

    function clearButtons() {
        buttonsRef.current.length = 0;
    }

    const drawNet = (data: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return; // Check if ctx is not null

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

    const drawGame = (data: any) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);  // Clear the canvas

        const canvasAspectRatio = canvas.width / canvas.height;

        let gameWidth: number, gameHeight: number;

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
        data.squares.forEach((square: any) => {
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

        if (data.isGameOver) {
            // Constants for layout
            clearButtons();
            const buttonOffsetY = gameHeight * 0.6;
            const winnerNameFontSize = gameHeight * 0.06;
            const textOffsetY = buttonOffsetY - winnerNameFontSize * 2;
            const eloTextOffsetY = textOffsetY + winnerNameFontSize + 5; // Below the winner's name
            const buttonWidth = gameWidth * 0.3;
            const buttonHeight = gameHeight * 0.1;
            const eloFontSize = winnerNameFontSize * 0.75; // Adjusted proportionally

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
            const localPlayerUsername = user.username;

            // Determine if the local player is the winner or loser
            const isLocalPlayerWinner = localPlayerUsername === data.winnerUsername;
            const isLocalPlayerLoser = localPlayerUsername === data.loserUsername;
            const localPlayerCurrentElo = isLocalPlayerWinner ? data.winnerCurrentElo : (isLocalPlayerLoser ? data.loserCurrentElo : null);
            const localPlayerEloChange = isLocalPlayerWinner ? data.winnerEloChange : (isLocalPlayerLoser ? data.loserEloChange : 0);
            const newElo = localPlayerCurrentElo + localPlayerEloChange;

            ctx.font = `${eloFontSize}px 'Press Start 2P', cursive`; // Update font size
            const eloChangeText = `Your ELO: ${Math.round(newElo)}`;
            ctx.fillText(eloChangeText, textX, offsetY + eloTextOffsetY);

            // Draw buttons
            drawButton(buttonX, offsetY + buttonOffsetY, buttonWidth, buttonHeight, 'MAIN MENU', goBackToMainMenu);
            drawButton(buttonX, offsetY + buttonOffsetY + buttonHeight * 1.5, buttonWidth, buttonHeight, 'PLAY AGAIN', goBackToSelectMode);

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
        if (!canvas) return;

        function handleResize() {
            const navbar = document.querySelector('.navbar') as HTMLElement; // Type assertion
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

            if (canvas) {
                canvas.width = newCanvasWidth;
                canvas.height = newCanvasHeight;
            }

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
        if (!canvas) return;

        const handleCanvasClick = (e: any) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            for (let btn of buttonsRef.current) {
                if (
                    mouseX > btn.x && mouseX < btn.x + btn.width &&
                    mouseY > btn.y && mouseY < btn.y + btn.height
                ) {
                    console.log(`Clicked on button: ${btn.text}`);
                    btn.callback();
                    return; // Break after finding the button
                }
            }
        };
        canvas.addEventListener('click', handleCanvasClick);

        return () => {
            canvas.removeEventListener('click', handleCanvasClick);
        };
    }, [buttonsRef.current]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            position: 'relative'
        }}>
            {isWaitingForPlayer ? (
                <div className="waiting-screen">
                    Waiting for the other player...
                </div>
            ) : (
                <>
                    <canvas ref={canvasRef} style={{ backgroundColor: '#0d0d0e' }} />
                    <div className="power-bar-container">
                        <div className="power-bar" key={powerBarLevel} style={{ width: `${powerBarLevel}%` }}></div>
                    </div>
                    {currentPower && (
                        <div className="current-power-display" >
                            Current Power: {currentPower.type}
                        </div>
                    )}
                </>
            )}
        </div>
    );


}

export default PowerPongGame;

import { Injectable } from '@nestjs/common';

const nbrOfSquares = 1;
const aspectRatio = 1318 / 807;
const paddleDistToWall = 1;
const paddleWidth = 2.26;
const paddleHeight = 18;
const leftPaddleY = 40;
const leftPaddleX = paddleDistToWall;
const rightPaddleY = 40;
const rightPaddleX = 100 - paddleWidth - paddleDistToWall;
const maxDy = 4;
const squareSize = 2.2;
const squareDy = 0;
const squareDx = 1.25;

@Injectable()
export class SquareGameService {

    private gameStates = new Map<string, any>(); // Using 'any' for simplicity, define a proper type for game state

    private squares = Array.from({ length: nbrOfSquares }, (_, index) => {
        const ySpacing = 100 / nbrOfSquares;
        return {
            x: 50,  // Positioning each square in the middle, minus half the size
            y: 50,
            // dx: index % 2 === 0 ? 1.8 : -0.5,  // Alternate directions: right for even indices, left for odd
            dx: squareDx,  // Alternate directions: right for even indices, left for odd
            dy: squareDy,  // No vertical movement
            // dy: 0.1,
            // size: 2.2
            size: squareSize
        };
    });

    private width = 100;
    private height = 100;
    private leftPaddle = { x: leftPaddleX, y: leftPaddleY, width: paddleWidth, height: paddleHeight };
    private rightPaddle = { x: rightPaddleX, y: rightPaddleY, width: paddleWidth, height: paddleHeight };
    private rightScore = 0;
    private leftScore = 0;
    public isGameOver = false;
    private rightWall = { x: 0, y: 0, width: 0, height: 100 };
    private leftWall = { x: 100, y: 0, width: 0, height: 100 };
    private topWall = { x: 0, y: 0, width: 100, height: 0 };
    private BottomWall = { x: 0, y: 100, width: 100, height: 0 };
    private gameLoop: NodeJS.Timeout;
    private moveLeftPaddleDirection: 'up' | 'down' | null = null;
    private moveRightPaddleDirection: 'up' | 'down' | null = null;
    private paddleMoveAmount = 2;
    private desiredLeftPaddleMovement: 'up' | 'down' | null = null;
    private desiredRightPaddleMovement: 'up' | 'down' | null = null;
    private maxDyValue = 5;
    private maxDxValue = 5;
    private angleFactor = 5;  // Adjust this value to make the effect stronger or weaker.
    public isGamePaused = false; // To keep track of the paused state

    resetGame() {
        this.leftScore = 0;
        this.rightScore = 0;
        this.isGameOver = false;

        this.leftPaddle = { x: leftPaddleX, y: leftPaddleY, width: paddleWidth, height: paddleHeight };
        this.rightPaddle = { x: rightPaddleX, y: rightPaddleY, width: paddleWidth, height: paddleHeight };

        // Reset squares to their initial state
        this.squares = Array.from({ length: nbrOfSquares }, (_, index) => {
            const ySpacing = 100 / nbrOfSquares;
            return {
                x: 50,  // Positioning each square in the middle, minus half the size
                y: index * ySpacing,
                // dx: index % 2 === 0 ? 1.8 : -0.5,  // Alternate directions: right for even indices, left for odd
                dx: squareDx,  // Alternate directions: right for even indices, left for odd
                dy: squareDy,  // No vertical movement
                // dy: 0.1,
                size: squareSize
            };
        });

    }

    private initializeGameState() {
        return {
            squares: Array.from({ length: nbrOfSquares }, (_, index) => {
                return {
                    x: 50, // Positioning each square in the middle
                    y: (100 / nbrOfSquares) * index,
                    dx: squareDx, // Initial horizontal speed
                    dy: squareDy, // Initial vertical speed
                    size: squareSize
                };
            }),
            leftPaddle: {
                x: leftPaddleX,
                y: leftPaddleY,
                width: paddleWidth,
                height: paddleHeight
            },
            rightPaddle: {
                x: rightPaddleX,
                y: rightPaddleY,
                width: paddleWidth,
                height: paddleHeight
            },
            leftScore: 0,
            rightScore: 0,
            isGameOver: false,
            width: 100,
            height: 100,
            rightWall: { x: 0, y: 0, width: 0, height: 100 },
            leftWall: { x: 100, y: 0, width: 0, height: 100 },
            topWall: { x: 0, y: 0, width: 100, height: 0 },
            BottomWall: { x: 0, y: 100, width: 100, height: 0 },
            gameLoop: null, // or appropriate initial value
            moveLeftPaddleDirection: null,
            moveRightPaddleDirection: null,
            paddleMoveAmount: 2,
            desiredLeftPaddleMovement: null,
            desiredRightPaddleMovement: null,
            maxDyValue: 5,
            maxDxValue: 5,
            angleFactor: 5,
            isGamePaused: false
            // Add any other game-related initial state variables here
        };
    }

    adjustDyOnCollision(distanceFromCenter, paddleHeight) {
        const relativeDistance = distanceFromCenter / paddleHeight;
        return (relativeDistance) * this.angleFactor;
    }

    updateGameState(gameId: any, clientInputs: any, callback: Function) {
        let gameState = this.gameStates.get(gameId);
        if (!gameState) {
            // Initialize game state for new gameId
            gameState = this.initializeGameState();
            this.gameStates.set(gameId, gameState);
        }

        const clientIds = Object.keys(clientInputs);

        // Assuming 2 players for left and right paddle
        if (clientIds.length >= 2 && !gameState.isGamePaused) {
            const leftClientActiveKeys = clientInputs[clientIds[0]];
            const rightClientActiveKeys = clientInputs[clientIds[1]];

            if (leftClientActiveKeys.includes("w")) {
                const potentialY = gameState.leftPaddle.y - gameState.paddleMoveAmount;
                gameState.leftPaddle.y = Math.max(potentialY, 0);
            } else if (leftClientActiveKeys.includes("s")) {
                const potentialY = gameState.leftPaddle.y + gameState.paddleMoveAmount;
                gameState.leftPaddle.y = Math.min(potentialY, 100 - gameState.leftPaddle.height);
            }

            if (rightClientActiveKeys.includes("ArrowUp")) {
                const potentialY = gameState.rightPaddle.y - gameState.paddleMoveAmount;
                gameState.rightPaddle.y = Math.max(potentialY, 0);
            } else if (rightClientActiveKeys.includes("ArrowDown")) {
                const potentialY = gameState.rightPaddle.y + gameState.paddleMoveAmount;
                gameState.rightPaddle.y = Math.min(potentialY, 100 - gameState.rightPaddle.height);
            }

            gameState.squares.forEach((square, idx) => {

                square.x += square.dx;
                square.y += square.dy;

                const leftPaddleDistance = this.intersects(square, gameState.leftPaddle);
                if (leftPaddleDistance !== null) {
                    square.dx = -square.dx;
                    square.dy = this.adjustDyOnCollision(leftPaddleDistance, gameState.leftPaddle.height);

                    // Reposition the square outside of the left paddle bounds
                    square.x = gameState.leftPaddle.x + gameState.leftPaddle.width;
                }

                const rightPaddleDistance = this.intersects(square, gameState.rightPaddle);
                if (rightPaddleDistance !== null) {
                    square.dx = -square.dx;
                    square.dy = this.adjustDyOnCollision(rightPaddleDistance, gameState.rightPaddle.height);

                    // Reposition the square outside of the right paddle bounds
                    square.x = gameState.rightPaddle.x - square.size;

                }

                // Check for wall intersections
                if (square.x + square.size < 0 || square.x > gameState.width) {
                    // Reset square position to the center
                    if (square.x > gameState.width)
                        gameState.leftScore++;
                    if (square.x + square.size < 0)
                        gameState.rightScore++;
                    square.x = gameState.width / 2;
                    square.y = gameState.height / 2;

                    square.dx = squareDx;
                    square.dy = squareDy;
                }

                //top wall
                if (square.y <= 0) {
                    square.dy = -square.dy;
                }

                //bottom wall
                if (square.y + square.size * aspectRatio >= 100) {
                    square.dy = -square.dy;
                }

            });

        }

        if (gameState.leftScore >= 100 || gameState.rightScore >= 100) {
            gameState.isGameOver = true;
            clearInterval(gameState.gameLoop); // Clear the game loop to stop the game
        }

        callback({
            squares: gameState.squares,
            leftPaddle: gameState.leftPaddle,
            rightPaddle: gameState.rightPaddle,
            leftScore: gameState.leftScore,
            rightScore: gameState.rightScore,
            isGameOver: gameState.isGameOver
        });

        if (!gameState.isGameOver) {
            setTimeout(() => this.updateGameState(gameId, clientInputs, callback), 1000 / 60);
        }
    }

    recIntersects(rectA, rectB) {
        return rectA.x < rectB.x + rectB.size &&
            rectA.x + rectA.size > rectB.x &&
            rectA.y < rectB.y + rectB.size &&
            rectA.y + rectA.size > rectB.y;
    }

    intersects(square, paddle) {
        if (
            square.x + square.size > paddle.x &&
            square.x < paddle.x + paddle.width &&
            square.y + square.size * aspectRatio > paddle.y &&
            square.y < paddle.y + paddle.height
        ) {
            // Calculate the distance between the center of the paddle and the center of the square
            const squareCenterY = square.y + (square.size * aspectRatio) / 2;
            const paddleCenterY = paddle.y + paddle.height / 2;
            const distance = squareCenterY - paddleCenterY;

            // Return the distance
            return distance;
        }
        return null;
    }

}
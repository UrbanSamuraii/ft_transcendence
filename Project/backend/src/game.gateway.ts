import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

const nbrOfSquares = 1;
// const aspectRatio = 2.0317460317;
// const aspectRatio = 1920 / 945;
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

@WebSocketGateway(3002, {
    cors: {
        origin: ["http://made-f0br5s2:3000", "http://localhost:3000", "*"], // allowed origins
        methods: ["GET", "POST"], // allowed methods
        credentials: true, // enable credentials
    },
})
export class GameGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;

    // private squares = Array(nbrOfSquares).fill(null).map(() => ({
    //     x: Math.random() * 80,  // ensure they don't spawn outside boundaries
    //     y: Math.random() * 80,
    //     dx: Math.random() * 4 - 2,
    //     dy: Math.random() * 4 - 2,
    //     size: 2
    // }));

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

    // private squares = Array.from({ length: nbrOfSquares }, (_, index) => {
    //     const ySpacing = 100 / nbrOfSquares;
    //     return {
    //         x: 50,
    //         y: 38,
    //         dx: index % 2 === 0 ? 1.8 : -0.5,  // Alternate directions: right for even indices, left for odd
    //         // dx: 1,  // Alternate directions: right for even indices, left for odd
    //         dy: 0,  // No vertical movement
    //         size: 2
    //     };
    // });

    private width = 100;
    private height = 100;
    private leftPaddle = { x: leftPaddleX, y: leftPaddleY, width: paddleWidth, height: paddleHeight };
    private rightPaddle = { x: rightPaddleX, y: rightPaddleY, width: paddleWidth, height: paddleHeight };
    private rightScore = 0;
    private leftScore = 0;
    private isGameOver = false;
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
    private isGamePaused = false; // To keep track of the paused state

    afterInit(server: Server) {
        console.log('Socket.io initialized');
        this.startGameLoop();
    }

    @SubscribeMessage('paddleMovements')
    handlePaddleMovements(client: Socket, activeKeys: string[]) {
        if (activeKeys.includes("w")) {
            this.desiredLeftPaddleMovement = 'up';
        } else if (activeKeys.includes("s")) {
            this.desiredLeftPaddleMovement = 'down';
        } else {
            this.desiredLeftPaddleMovement = null;
        }

        if (activeKeys.includes("ArrowUp")) {
            this.desiredRightPaddleMovement = 'up';
        } else if (activeKeys.includes("ArrowDown")) {
            this.desiredRightPaddleMovement = 'down';
        } else {
            this.desiredRightPaddleMovement = null;
        }
    }

    @SubscribeMessage('pauseGame')
    handlePauseGame(client: Socket) {
        this.isGamePaused = true;
    }

    @SubscribeMessage('resumeGame')
    handleResumeGame(client: Socket) {
        this.isGamePaused = false;
    }

    resetGame() {
        this.leftScore = 0;
        this.rightScore = 0;
        this.isGameOver = false;

        // Reset the left and right paddles to their initial positions
        // this.leftPaddle = { x: 10, y: 40, width: 1, height: 15 };
        // this.rightPaddle = { x: 88, y: 40, width: 1, height: 15 };
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

        // Restart the game loop
        this.startGameLoop();
    }

    @SubscribeMessage('startGame')
    handleStartGame(client: Socket) {
        if (this.isGameOver) {
            this.resetGame();
        }
    }

    // adjustDyOnCollision = (squareY, paddleY, paddleHeight) => {
    //     const relativeSquarePosition = (squareY + 1.1 * aspectRatio - paddleY) / paddleHeight;
    //     // console.log("hitting, dy = ", square.dy);
    //     console.log("hitting, square.y = ", squareY);
    //     console.log("hitting, paddleY = ", paddleY);
    //     console.log("hitting, paddleHeight = ", paddleHeight);
    //     console.log("relativeSquarePosition = ", relativeSquarePosition);

    //     return (relativeSquarePosition - 0.5) * this.angleFactor;
    // };

    adjustDyOnCollision(distanceFromCenter, paddleHeight) {
        const relativeDistance = distanceFromCenter / paddleHeight;
        return (relativeDistance) * this.angleFactor;
    }

    moveSquare() {
        // Move the left paddle based on desired movement


        if (this.isGamePaused) return;

        if (this.desiredLeftPaddleMovement === 'up') {
            const potentialY = this.leftPaddle.y - this.paddleMoveAmount;
            this.leftPaddle.y = Math.max(potentialY, 0);
        } else if (this.desiredLeftPaddleMovement === 'down') {
            const potentialY = this.leftPaddle.y + this.paddleMoveAmount;
            this.leftPaddle.y = Math.min(potentialY, 100 - this.leftPaddle.height);
        }

        // Move the right paddle based on desired movement
        if (this.desiredRightPaddleMovement === 'up') {
            const potentialY = this.rightPaddle.y - this.paddleMoveAmount;
            this.rightPaddle.y = Math.max(potentialY, 0);
        } else if (this.desiredRightPaddleMovement === 'down') {
            const potentialY = this.rightPaddle.y + this.paddleMoveAmount;
            this.rightPaddle.y = Math.min(potentialY, 100 - this.rightPaddle.height);
        }

        this.squares.forEach((square, idx) => {

            square.x += square.dx;
            square.y += square.dy;

            // if (this.intersects(square, this.leftPaddle)) {
            //     square.dx = -square.dx;
            //     square.dy += this.adjustDyOnCollision(square.y, this.leftPaddle.y, this.leftPaddle.height);
            // }

            // if (this.intersects(square, this.rightPaddle)) {
            //     square.dx = -square.dx;
            //     square.dy += this.adjustDyOnCollision(square.y, this.rightPaddle.y, this.rightPaddle.height);
            // }

            const leftPaddleDistance = this.intersects(square, this.leftPaddle);
            if (leftPaddleDistance !== null) {
                square.dx = -square.dx;
                square.dy = this.adjustDyOnCollision(leftPaddleDistance, this.leftPaddle.height);

                // Reposition the square outside of the left paddle bounds
                square.x = this.leftPaddle.x + this.leftPaddle.width;
            }

            const rightPaddleDistance = this.intersects(square, this.rightPaddle);
            if (rightPaddleDistance !== null) {
                square.dx = -square.dx;
                square.dy = this.adjustDyOnCollision(rightPaddleDistance, this.rightPaddle.height);

                // Reposition the square outside of the right paddle bounds
                square.x = this.rightPaddle.x - square.size;

            }

            // Check for wall intersections
            if (square.x + square.size < 0 || square.x > this.width) {
                // Reset square position to the center
                if (square.x > this.width)
                    this.leftScore++;
                if (square.x + square.size < 0)
                    this.rightScore++;
                square.x = this.width / 2;
                square.y = this.height / 2;

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

        if (this.leftScore >= 10000 || this.rightScore >= 10000) {
            this.isGameOver = true;
            clearInterval(this.gameLoop); // Clear the game loop to stop the game
        }

        this.server.emit('updateGameData', {
            squares: this.squares,
            leftPaddle: this.leftPaddle,
            rightPaddle: this.rightPaddle,
            leftScore: this.leftScore,
            rightScore: this.rightScore,
            isGameOver: this.isGameOver
        });
    }

    recIntersects(rectA, rectB) {
        return rectA.x < rectB.x + rectB.size &&
            rectA.x + rectA.size > rectB.x &&
            rectA.y < rectB.y + rectB.size &&
            rectA.y + rectA.size > rectB.y;
    }

    private i = 0;
    // intersects(square, paddle) {
    //     if (
    //         square.x <= paddle.x + paddle.width && square.x + square.size > paddle.x &&
    //         // square.y + square.size >= paddle.y && square.y <= paddle.y + paddle.height
    //         square.y + square.size * aspectRatio >= paddle.y && square.y <= paddle.y + paddle.height
    //     ) {
    //         // if (this.i < 1)
    //         //     console.log("true = ", square.x, paddle.x, paddle.width, square.size);
    //         this.i++;
    //         return true;
    //     }
    //     // if (this.i < 1)
    //     // console.log("false = ", square.x, paddle.x, paddle.width, square.size);
    //     return false;
    // }

    // intersects(square, paddle) {
    //     if (
    //         square.x + square.size > paddle.x &&
    //         square.x < paddle.x + paddle.width &&
    //         square.y + square.size * aspectRatio > paddle.y &&
    //         square.y < paddle.y + paddle.height
    //     ) {
    //         // Collision detected on left or right side
    //         return true;
    //     }
    //     return false;
    // }

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

    startGameLoop() {
        setTimeout(() => {
            this.gameLoop = setInterval(() => {
                this.moveSquare();
            }, 1000 / 60);
        }, 10);  // milliseconds
    }

}

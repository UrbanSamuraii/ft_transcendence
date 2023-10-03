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

    adjustDyOnCollision(distanceFromCenter, paddleHeight) {
        const relativeDistance = distanceFromCenter / paddleHeight;
        return (relativeDistance) * this.angleFactor;
    }

    updateGameState(clientInputs, callback: Function) {

        const clientIds = Object.keys(clientInputs);

        // Assuming 2 players for left and right paddle
        if (clientIds.length >= 2 && !this.isGamePaused) {
            const leftClientActiveKeys = clientInputs[clientIds[0]];
            const rightClientActiveKeys = clientInputs[clientIds[1]];

            if (leftClientActiveKeys.includes("w")) {
                const potentialY = this.leftPaddle.y - this.paddleMoveAmount;
                this.leftPaddle.y = Math.max(potentialY, 0);
            } else if (leftClientActiveKeys.includes("s")) {
                const potentialY = this.leftPaddle.y + this.paddleMoveAmount;
                this.leftPaddle.y = Math.min(potentialY, 100 - this.leftPaddle.height);
            }

            if (rightClientActiveKeys.includes("ArrowUp")) {
                const potentialY = this.rightPaddle.y - this.paddleMoveAmount;
                this.rightPaddle.y = Math.max(potentialY, 0);
            } else if (rightClientActiveKeys.includes("ArrowDown")) {
                const potentialY = this.rightPaddle.y + this.paddleMoveAmount;
                this.rightPaddle.y = Math.min(potentialY, 100 - this.rightPaddle.height);
            }

            this.squares.forEach((square, idx) => {

                square.x += square.dx;
                square.y += square.dy;

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

        }

        if (this.leftScore >= 10000 || this.rightScore >= 10000) {
            this.isGameOver = true;
            clearInterval(this.gameLoop); // Clear the game loop to stop the game
        }

        callback({
            squares: this.squares,
            leftPaddle: this.leftPaddle,
            rightPaddle: this.rightPaddle,
            leftScore: this.leftScore,
            rightScore: this.rightScore,
            isGameOver: this.isGameOver
        });

        if (!this.isGameOver) {
            setTimeout(() => this.updateGameState(clientInputs, callback), 1000 / 60);
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
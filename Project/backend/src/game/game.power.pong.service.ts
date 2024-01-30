import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PlayerInfo } from './game.gateway';

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

enum PowerType {
    Expand = 'Expand',
    SpeedBoost = 'SpeedBoost',
}

interface Power {
    type: PowerType;
    duration: number; // in milliseconds
    effectApplied: boolean;
}

@Injectable()
export class PowerPongGameService {

    private gameStates = new Map<string, any>(); // Using 'any' for simplicity, define a proper type for game state

    constructor(private userService: UserService) { }

    private angleFactor = 5;  // Adjust this value to make the effect stronger or weaker.
    public isGamePaused = false; // To keep track of the paused state

    private initializeGameState(playerInfoMap: any) {
        const playerInfos = Array.from(playerInfoMap.values());
        const leftPlayerInfoUse = playerInfos[0] as { username: string }; // Adjust the type as needed
        const rightPlayerInfoUse = playerInfos[0] as { username: string }; // Adjust the type as needed

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
            leftPlayerInfo: {
                username: leftPlayerInfoUse.username, // Will be set when the game starts
                powerBarLevel: 0,
                power: null, // No power selected initially
                // ... other player-specific properties
            },
            rightPlayerInfo: {
                username: rightPlayerInfoUse.username, // Will be set when the game starts
                powerBarLevel: 0,
                power: null, // No power selected initially
                // ... other player-specific properties
            },
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

    // updateGameState(gameId: any, clientInputs: any, callback: Function) {
    // updateGameState(gameId: any, playerInfoMap: Map<number, PlayerInfo>, callback: Function) {
    updateGameState(gameId: number, playerInfoMap: Map<string, PlayerInfo>, callback: Function) {
        let gameState = this.gameStates.get(gameId.toString());
        if (!gameState) {
            // Initialize game state for new gameId
            gameState = this.initializeGameState(playerInfoMap);
            this.gameStates.set(gameId.toString(), gameState);

        }


        // Assuming 2 players for left and right paddle
        const playerInfos = Array.from(playerInfoMap.values());
        gameState.leftPlayerInfo.powerBarLevel = Math.min(gameState.leftPlayerInfo.powerBarLevel + 1, 100);
        gameState.rightPlayerInfo.powerBarLevel = Math.min(gameState.rightPlayerInfo.powerBarLevel + 1, 100);
        // Assuming 2 players for left and right paddle
        if (playerInfos.length >= 2 && !gameState.isGamePaused) {
            const leftPlayerInfo = playerInfos[0];
            const rightPlayerInfo = playerInfos[1];
            // Handle left player paddle movement
            if (leftPlayerInfo.activeKeys.includes("w")) {
                const potentialY = gameState.leftPaddle.y - gameState.paddleMoveAmount;
                gameState.leftPaddle.y = Math.max(potentialY, 0);
            } else if (leftPlayerInfo.activeKeys.includes("s")) {
                const potentialY = gameState.leftPaddle.y + gameState.paddleMoveAmount;
                gameState.leftPaddle.y = Math.min(potentialY, 100 - gameState.leftPaddle.height);
            }

            // Handle right player paddle movement
            if (rightPlayerInfo.activeKeys.includes("ArrowUp")) {
                const potentialY = gameState.rightPaddle.y - gameState.paddleMoveAmount;
                gameState.rightPaddle.y = Math.max(potentialY, 0);
            } else if (rightPlayerInfo.activeKeys.includes("ArrowDown")) {
                const potentialY = gameState.rightPaddle.y + gameState.paddleMoveAmount;
                gameState.rightPaddle.y = Math.min(potentialY, 100 - gameState.rightPaddle.height);
            }
            if (leftPlayerInfo.activeKeys.includes(" ") && gameState.leftPlayerInfo.powerBarLevel === 100) {
                this.activatePower(gameState.leftPlayerInfo, gameState);
            }

            // Check and handle power activation for right player
            if (rightPlayerInfo.activeKeys.includes(" ") && gameState.rightPlayerInfo.powerBarLevel === 100) {
                this.activatePower(gameState.rightPlayerInfo, gameState);
            }
            if (gameState.leftPlayerInfo.power && !gameState.leftPlayerInfo.power.effectApplied) {
                switch (gameState.leftPlayerInfo.power.type) {
                    case PowerType.Expand:
                        gameState.leftPaddle.height *= 1.5; // Increase paddle height by 50%
                        break;
                    case PowerType.SpeedBoost:
                        gameState.squares.forEach(square => square.dx *= 1.5); // Increase ball speed by 50%
                        break;
                }
                gameState.leftPlayerInfo.power.effectApplied = true;

                // Set a timeout to end the power effect after its duration
                setTimeout(() => {
                    switch (gameState.leftPlayerInfo.power.type) {
                        case PowerType.Expand:
                            gameState.leftPaddle.height /= 1.5; // Revert paddle height to original
                            break;
                        case PowerType.SpeedBoost:
                            gameState.squares.forEach(square => square.dx /= 1.5); // Revert ball speed to original
                            break;
                    }
                    gameState.leftPlayerInfo.power = null; // Remove the power as it's no longer active
                }, gameState.leftPlayerInfo.power.duration);
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
                    if (square.x > gameState.width) leftPlayerInfo.score++;
                    if (square.x + square.size < 0) rightPlayerInfo.score++;
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

            gameState.leftScore = leftPlayerInfo.score;
            gameState.rightScore = rightPlayerInfo.score; //both lines are placeholders to remove when i do frontend

            if (gameState.leftScore >= 10 || gameState.rightScore >= 10) {
                gameState.isGameOver = true;
                clearInterval(gameState.gameLoop); // Clear the game loop to stop the game
                const winnerUsername = leftPlayerInfo.score > rightPlayerInfo.score ? leftPlayerInfo.username : rightPlayerInfo.username;
                const loserUsername = leftPlayerInfo.score < rightPlayerInfo.score ? leftPlayerInfo.username : rightPlayerInfo.username;

                const winnerInfo = playerInfoMap.get(winnerUsername);
                const loserInfo = playerInfoMap.get(loserUsername);
                const winnerEloChange = winnerInfo.potentialEloGain;
                const loserEloChange = loserInfo.potentialEloLoss;

                callback({
                    squares: gameState.squares,
                    leftPaddle: gameState.leftPaddle,
                    rightPaddle: gameState.rightPaddle,
                    leftScore: gameState.leftScore,
                    rightScore: gameState.rightScore,
                    isGameOver: gameState.isGameOver,
                    winnerUsername: winnerUsername,
                    loserUsername: loserUsername,
                    winnerEloChange: winnerEloChange,
                    loserEloChange: loserEloChange,
                    winnerCurrentElo: winnerInfo.currentElo,
                    loserCurrentElo: loserInfo.currentElo,
                });
            } else {
                callback({
                    squares: gameState.squares,
                    leftPaddle: gameState.leftPaddle,
                    rightPaddle: gameState.rightPaddle,
                    leftScore: gameState.leftScore,
                    rightScore: gameState.rightScore,
                    isGameOver: gameState.isGameOver
                });

                if (!gameState.isGameOver) {
                    setTimeout(() => this.updateGameState(gameId, playerInfoMap, callback), 1000 / 60);
                }
            }
        }
    }

    recIntersects(rectA, rectB) {
        return rectA.x < rectB.x + rectB.size &&
            rectA.x + rectA.size > rectB.x &&
            rectA.y < rectB.y + rectB.size &&
            rectA.y + rectA.size > rectB.y;
    }

    private activatePower(playerInfo: PlayerInfo, gameState: any) {
        if (!playerInfo.selectedPower) return; // Ensure there is a power to activate

        const power = playerInfo.selectedPower;
        playerInfo.selectedPower = {
            ...power,
            effectApplied: false,
        };
        playerInfo.powerBarLevel = 0; // Reset the power bar

        // Apply the power effect immediately
        switch (power.type) {
            case PowerType.Expand:
                if (playerInfo.username === gameState.leftPlayerInfo.username) {
                    gameState.leftPaddle.height *= 1.5; // Increase paddle height by 50%
                } else {
                    gameState.rightPaddle.height *= 1.5; // Increase paddle height by 50%
                }
                break;
            case PowerType.SpeedBoost:
                gameState.squares.forEach(square => square.dx *= 1.5); // Increase ball speed by 50%
                break;
        }
        playerInfo.selectedPower.effectApplied = true;

        // Set a timeout to end the power effect after its duration
        setTimeout(() => {
            switch (power.type) {
                case PowerType.Expand:
                    if (playerInfo.username === gameState.leftPlayerInfo.username) {
                        gameState.leftPaddle.height /= 1.5; // Revert paddle height to original
                    } else {
                        gameState.rightPaddle.height /= 1.5; // Revert paddle height to original
                    }
                    break;
                case PowerType.SpeedBoost:
                    gameState.squares.forEach(square => square.dx /= 1.5); // Revert ball speed to original
                    break;
            }
            playerInfo.selectedPower = null; // Remove the power as it's no longer active
        }, power.duration);
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
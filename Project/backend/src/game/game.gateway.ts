import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SquareGameService } from './game.square.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from "src/prisma/prisma.service";
import { v4 as uuidv4 } from 'uuid';
import { Prisma, User, Game } from '@prisma/client';

export interface PlayerInfo {
    username: string;
    score: number;
    activeKeys: string[]; // array of keys currently being pressed
}

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:3000", "*"], // allowed origins
        methods: ["GET", "POST"], // allowed methods
        credentials: true, // enable credentials
    },
})
export class GameGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
    private queue: Socket[] = [];
    private playerInfoMap = new Map<number, PlayerInfo>();
    private gameLoop: NodeJS.Timeout;
    private userInGameMap = new Map<string, boolean>();
    private userCurrentGameMap = new Map<string, number>(); // username -> gameId

    constructor(private gameService: SquareGameService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private prisma: PrismaService // Inject Prisma service here

    ) { }

    private removeFromQueue(clientToRemove: Socket) {
        console.log("Queue before removal:", this.queue.map(client => client.id)); // Print queue before removal
        this.queue = this.queue.filter(client => client !== clientToRemove);
        console.log("Queue after removal:", this.queue.map(client => client.id)); // Print queue after removal

    }

    afterInit(server: Server) {
        console.log("Socket.io initialized");
    }

    private async handleGameOver(winnerUsername: string, gameId: number): Promise<void> {
        try {
            // Fetch the winner's ID based on the username
            const winnerId = await this.userService.getUserIdByUsername(winnerUsername);
            if (winnerId) {
                // Increment the winner's total games won
                await this.userService.incrementGamesWon(winnerId);

                // Optionally, you can also emit an event to all clients in the game room about the game over
                this.server.to(gameId.toString()).emit('gameOver', { winnerUsername });
            }
        } catch (error) {
            console.error('Error in handleGameOver:', error);
            // Handle errors appropriately
        }
    }

    async handleConnection(client: Socket, ...args: any[]) {
        // Listen for disconnect
        client.on('disconnect', (reason) => {
            // console.log('Client disconnected:', client.id);
            console.log('Client disconnected:', 'Reason:', reason);
        });
    }

    @SubscribeMessage('leaveMatchmaking')
    handleLeaveMatchmaking(client: Socket) {
        console.log("handleLeaveMatchmaking");
        this.removeFromQueue(client);
        if (client.data?.user?.username) {
            this.playerInfoMap.delete(client.data.user.username);
            console.log(`Removed ${client.data.user.username} from playerInfoMap`);
        }
    }

    private async verifyTokenAndGetUserInfo(client: Socket): Promise<User | null> {
        const token = client.handshake.headers.cookie?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
        if (!token) {
            console.log('No token provided from enterMatchmaking');
            return null;
        }

        try {
            const decoded = this.jwtService.verify(token);
            const userInfo = await this.userService.getUserByToken(token);
            return userInfo;
        } catch (e) {
            console.log('Invalid token', e);
            return null;
        }
    }

    private isUserInQueue(username: string): boolean {
        return this.queue.some(client => client.data.user.username === username);
    }

    private addUserToQueue(client: Socket, userInfo: User): void {
        client.data.user = userInfo;

        if (this.userInGameMap.get(userInfo.username)) {
            console.log('User is already in a game, user:', userInfo.username);
            return;
        }

        const playerInfo: PlayerInfo = {
            // id: client.data.user.sub, // or appropriate user ID
            // username: client.data.user.username,
            username: userInfo.username,
            score: 0,
            activeKeys: []
        };
        this.playerInfoMap.set(client.data.user.username, playerInfo);
        this.queue.push(client);
    }

    private resetUserGameStatus(username: string): void {
        this.userInGameMap.set(username, false);
    }

    private async startMatchmaking(): Promise<void> {
        // Ensure that we have at least two players in the queue
        if (this.queue.length < 2) {
            return;
        }

        // Dequeue the first two players
        const player1 = this.queue.shift();
        const player2 = this.queue.shift();

        // Basic validation
        if (!player1 || !player2) {
            return;
        }

        this.userInGameMap.set(player1.data.user.username, true);
        this.userInGameMap.set(player2.data.user.username, true);

        // Create a new game in your database or game management system
        const newGame = await this.createGame(player1, player2);

        // Add additional game setup logic here if needed

        // Notify both players that a match has been found
        const gameId = newGame.id;  // Assuming newGame has an 'id' property
        player1.join(gameId.toString());
        player2.join(gameId.toString());
        player1.emit('matchFound', { opponent: player2.data.user, gameId });
        player2.emit('matchFound', { opponent: player1.data.user, gameId });


        this.gameService.updateGameState(gameId, this.playerInfoMap, (data) => {
            this.server.to(gameId.toString()).emit('updateGameData', {
                ...data,
            });


            if (data.isGameOver && data.winnerUsername) {
                this.resetUserGameStatus(player1.data.user.username);
                this.resetUserGameStatus(player2.data.user.username);
                this.handleGameOver(data.winnerUsername, gameId).catch((error) => {
                    console.error('Error handling game over:', error);
                    // Handle any errors that occur in the game over handling
                });
            }
        });

        console.log(`Matched ${player1.id} with ${player2.id}`);
    }

    private async createGame(player1: Socket, player2: Socket): Promise<Game> {
        // Implement the logic to create a new game instance
        // This could involve creating a record in the database, initializing game state, etc.
        // For example, using a Prisma client:
        const newGame = await this.prisma.game.create({
            data: {
                // Define the data needed to create a new game
                uniqueId: uuidv4(),
                player1Id: player1.data.user.id,
                player2Id: player2.data.user.id,
                // Other game-related data...
            }
        });
        this.userCurrentGameMap.set(player1.data.user.username, newGame.id);
        this.userCurrentGameMap.set(player2.data.user.username, newGame.id);
        return newGame;
    }

    private getCurrentGameIdForUser(username: string): number | null {
        return this.userCurrentGameMap.get(username) || null;
    }

    @SubscribeMessage('enterMatchmaking')
    async handleEnterMatchmaking(client: Socket) {


        const userInfo = await this.verifyTokenAndGetUserInfo(client);
        if (!userInfo) {
            client.disconnect(true); // Disconnect if no valid token
            return;
        }

        if (this.isUserInQueue(userInfo.username)) {
            console.log('User already in queue');
            return;
        }

        this.addUserToQueue(client, userInfo);

        if (this.queue.length >= 2) {
            this.startMatchmaking();
        }
    }

    @SubscribeMessage('paddleMovements')
    handlePaddleMovements(client: Socket, activeKeys: string[]) {
        if (!client.data || !client.data.user) {
            console.error('User data is not available in handlePaddleMovements');
            return;
        }

        const playerUsername = client.data.user.username;

        if (!playerUsername) {
            console.error('Player username is not available in handlePaddleMovements');
            return;
        }

        const playerInfo = this.playerInfoMap.get(playerUsername);

        if (!playerInfo) {
            console.error(`Player info not found for username: ${playerUsername} in handlePaddleMovements`);
            return;
        }

        if (playerInfo) {
            playerInfo.activeKeys = activeKeys;
        }
    }

    @SubscribeMessage('pauseGame')
    handlePauseGame(client: Socket) {
        this.gameService.isGamePaused = true;
    }

    @SubscribeMessage('resumeGame')
    handleResumeGame(client: Socket) {
        this.gameService.isGamePaused = false;
    }

    @SubscribeMessage('checkGameStatus')
    async handleCheckGameStatus(client: Socket): Promise<void> {
        const userInfo = await this.verifyTokenAndGetUserInfo(client);
        if (!userInfo) {
            client.emit('gameStatusResponse', { inGame: false });
            return;
        }

        const inGame = this.userInGameMap.get(userInfo.username);
        const gameId = inGame ? this.getCurrentGameIdForUser(userInfo.username) : null;

        client.emit('gameStatusResponse', { inGame, gameId });
    }

    @SubscribeMessage('attemptReconnect')
    async handleAttemptReconnect(client: Socket, payload: { username: string; gameId: string }): Promise<void> {
        // Check if the user is supposed to be in the game room
        // if (this.isUserInGame(payload.username, payload.gameId) && !this.isUserInRoom(client, payload.gameId)) {
        client.join(payload.gameId);
        // const gameState = this.getGameState(payload.gameId);
        // client.emit('gameStateUpdate', gameState);
        // }
    }
}
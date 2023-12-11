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
    currentElo: number;
    potentialEloGain: number;
    potentialEloLoss: number;
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
    // private playerInfoMap = new Map<number, PlayerInfo>();
    private playerInfoMap = new Map<number, Map<string, PlayerInfo>>();
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

    async calculateEloRatings(winnerId: number, loserId: number) {
        const kFactor = 32; // K-factor determines the sensitivity of ELO rating changes
        const winnerRating = await this.userService.getEloRating(winnerId);
        const loserRating = await this.userService.getEloRating(loserId);

        const expectedWinnerScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
        const expectedLoserScore = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

        const newWinnerRating = winnerRating + kFactor * (1 - expectedWinnerScore);
        const newLoserRating = loserRating + kFactor * (0 - expectedLoserScore);

        return { newWinnerRating, newLoserRating };
    }

    async calculatePotentialEloChanges(player1Id: number, player2Id: number) {
        const kFactor = 32; // K-factor for ELO calculation. Adjust as needed.
        const player1Rating = await this.userService.getEloRating(player1Id);
        const player2Rating = await this.userService.getEloRating(player2Id);

        // Calculate expected scores
        const expectedScorePlayer1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
        const expectedScorePlayer2 = 1 / (1 + Math.pow(10, (player1Rating - player2Rating) / 400));

        // Calculate potential ELO gains and losses
        const potentialGainPlayer1 = Math.round(kFactor * (1 - expectedScorePlayer1));
        const potentialLossPlayer1 = Math.round(kFactor * (0 - expectedScorePlayer1));
        const potentialGainPlayer2 = Math.round(kFactor * (1 - expectedScorePlayer2));
        const potentialLossPlayer2 = Math.round(kFactor * (0 - expectedScorePlayer2));

        return {
            player1: { potentialEloGain: potentialGainPlayer1, potentialEloLoss: potentialLossPlayer1 },
            player2: { potentialEloGain: potentialGainPlayer2, potentialEloLoss: potentialLossPlayer2 }
        };
    }



    private async handleGameOver(winnerUsername: string, loserUsername: string, gameId: number): Promise<void> {
        try {
            const winnerId = await this.userService.getUserIdByUsername(winnerUsername);
            const loserId = await this.userService.getUserIdByUsername(loserUsername);

            if (winnerId && loserId) {
                await this.userService.incrementGamesWon(winnerId);
                await this.userService.incrementGamesLost(loserId);

                // Calculate new ELO ratings
                const eloRatings = await this.calculateEloRatings(winnerId, loserId);
                const { newWinnerRating, newLoserRating } = eloRatings;

                // Update ELO ratings
                await this.userService.updateEloRating(winnerId, newWinnerRating);
                await this.userService.updateEloRating(loserId, newLoserRating);

                this.server.to(gameId.toString()).emit('gameOver', { winnerUsername });
            }
        } catch (error) {
            console.error('Error in handleGameOver:', error);
        }
    }

    async handleConnection(client: Socket, ...args: any[]) {
        // Listen for disconnect
        client.on('disconnect', (reason) => {
            // console.log('Client disconnected:', client.id);
            console.log('Client disconnected:', 'Reason:', reason);
            // console.log("this socket was in this room: ", client.rooms); // the Set contains at least the socket ID
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

    private async addUserToQueue(client: Socket, userInfo: User): Promise<void> {
        client.data.user = userInfo;

        if (this.userInGameMap.get(userInfo.username)) {
            console.log('User is already in a game, user:', userInfo.username);
            return;
        }
        this.queue.push(client);

        let currentElo;

        try {
            // Attempt to fetch the current ELO rating
            currentElo = await this.userService.getEloRating(userInfo.id);
        } catch (error) {
            console.error(`Error fetching ELO rating for user ${userInfo.username}:`, error);
            // Set a default ELO rating or handle the error as needed
            currentElo = 1000; // Example default ELO rating
            // Optionally, you can decide not to add the user to the queue if ELO is critical
            // return; // Uncomment this line if you don't want to add users without a valid ELO rating
        }

        const playerInfo: PlayerInfo = {
            username: userInfo.username,
            score: 0,
            activeKeys: [],
            currentElo: currentElo,
            potentialEloGain: 0,
            potentialEloLoss: 0,
        };

        client.data.playerInfo = playerInfo;
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

        const gameId = newGame.id;

        const eloChanges = await this.calculatePotentialEloChanges(player1.data.user.id, player2.data.user.id);

        // Update playerInfo with ELO changes
        const updatedPlayer1Info = { ...player1.data.playerInfo, ...eloChanges.player1 };
        const updatedPlayer2Info = { ...player2.data.playerInfo, ...eloChanges.player2 };

        const gamePlayerInfoMap = new Map<string, PlayerInfo>();
        gamePlayerInfoMap.set(player1.data.user.username, updatedPlayer1Info);
        gamePlayerInfoMap.set(player2.data.user.username, updatedPlayer2Info);

        this.playerInfoMap.set(gameId, gamePlayerInfoMap);

        player1.join(gameId.toString());
        player2.join(gameId.toString());
        console.log('%s player1 has joined %s room', player1.data.user.username, gameId.toString())
        console.log('%s player2 has joined %s room', player2.data.user.username, gameId.toString())
        player1.emit('matchFound', { opponent: player2.data.user, gameId });
        player2.emit('matchFound', { opponent: player1.data.user, gameId });

        // this.gameService.updateGameState(gameId, this.playerInfoMap, (data) => {
        this.gameService.updateGameState(gameId, this.playerInfoMap.get(gameId), (data) => {
            this.server.to(gameId.toString()).emit('updateGameData', {
                ...data,
            });


            if (data.isGameOver && data.winnerUsername && data.loserUsername) {
                this.resetUserGameStatus(player1.data.user.username);
                this.resetUserGameStatus(player2.data.user.username);
                player1.leave(gameId.toString());
                player2.leave(gameId.toString());
                // console.log('%s player1 has left %s room', player1.data.user.username, gameId.toString())
                // console.log('%s player2 has left %s room', player2.data.user.username, gameId.toString())
                this.playerInfoMap.delete(player1.data.user.username);
                this.playerInfoMap.delete(player2.data.user.username);
                this.userCurrentGameMap.delete(player1.data.user.username);
                this.userCurrentGameMap.delete(player2.data.user.username);
                this.handleGameOver(data.winnerUsername, data.loserUsername, gameId).catch((error) => {
                    console.error('Error handling game over:', error);
                });
            }
        });

        // console.log(`Matched ${player1.id} with ${player2.id}`);
        console.log(`Matched ${player1.data.user.username} with ${player2.data.user.username}`);
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

        const gameId = this.userCurrentGameMap.get(playerUsername);
        if (gameId === null || gameId === undefined) {
            console.error(`Game ID not found for username: ${playerUsername}`);
            return;
        }

        const gamePlayerInfoMap = this.playerInfoMap.get(gameId);
        if (!gamePlayerInfoMap) {
            console.error(`Player info map not found for game ID: ${gameId}`);
            return;
        }

        const playerInfo = gamePlayerInfoMap.get(playerUsername);
        if (!playerInfo) {
            console.error(`Player info not found for username: ${playerUsername} in game ID: ${gameId}`);
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
        client.join(payload.gameId.toString());
        // const gameState = this.getGameState(payload.gameId);
        // client.emit('gameStateUpdate', gameState);
        // }
    }
}
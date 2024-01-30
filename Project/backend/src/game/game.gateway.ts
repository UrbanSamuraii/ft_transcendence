import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SquareGameService } from './game.square.service';
import { PowerPongGameService } from './game.power.pong.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from "src/prisma/prisma.service";
import { v4 as uuidv4 } from 'uuid';
import { Prisma, User, Game } from '@prisma/client';
const server_adress = process.env.SERVER_ADRESS;

enum PowerType {
    Expand = 'Expand',
    SpeedBoost = 'SpeedBoost',
    MultiBall = 'MultiBall',
}

interface Power {
    type: PowerType;
    duration: number; // in milliseconds
}

export interface PlayerInfo {
    username: string;
    score: number;
    activeKeys: string[]; // array of keys currently being pressed
    currentElo: number;
    potentialEloGain: number;
    potentialEloLoss: number;
    selectedPower: Power | null;
    powerBarLevel: number;
    lastPowerActivation: number;
}

@WebSocketGateway({
    cors: {
        origin: [`http://${server_adress}:3000`, "*"], // allowed origins
        methods: ["GET", "POST"], // allowed methods
        credentials: true, // enable credentials
    },
})
export class GameGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
    // private queue: Socket[] = [];
    private queue: { socket: Socket, gameMode: string }[] = [];
    private playerInfoMap = new Map<number, Map<string, PlayerInfo>>();
    private gameLoop: NodeJS.Timeout;
    private userInGameMap = new Map<string, boolean>();
    // private userCurrentGameMap = new Map<string, number>();
    // private userCurrentGameMap = new Map<string, Map<string, number>>();
    private userCurrentGameMap = new Map<string, { gameId: number, gameMode: string }>();

    constructor(private classicGameService: SquareGameService,
        private PowerPongGameService: PowerPongGameService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private prisma: PrismaService // Inject Prisma service here

    ) { }

    private removeFromQueue(clientToRemove: Socket) {
        console.log("Queue before removal:", this.queue.map(client => client.socket.id)); // Adjusted for new queue structure
        this.queue = this.queue.filter(client => client.socket !== clientToRemove);
        console.log("Queue after removal:", this.queue.map(client => client.socket.id)); // Adjusted for new queue structure
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

        const newWinnerRating = Math.round(winnerRating + kFactor * (1 - expectedWinnerScore));
        const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoserScore));

        return { newWinnerRating, newLoserRating };
    }

    async calculatePotentialEloChanges(player1Id: number, player2Id: number) {
        const kFactor = 32; // K-factor for ELO calculation. Adjust as needed.
        const player1Rating = await this.userService.getEloRating(player1Id);
        const player2Rating = await this.userService.getEloRating(player2Id);
        // console.log(`player1Rating: ${player1Rating}`)
        // console.log(`player2Rating: ${player2Rating}`)

        // Calculate expected scores
        const expectedScorePlayer1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400));
        const expectedScorePlayer2 = 1 / (1 + Math.pow(10, (player1Rating - player2Rating) / 400));

        // Calculate potential ELO gains and losses
        const potentialGainPlayer1 = Math.round(kFactor * (1 - expectedScorePlayer1));
        const potentialLossPlayer1 = Math.round(kFactor * (0 - expectedScorePlayer1));
        const potentialGainPlayer2 = Math.round(kFactor * (1 - expectedScorePlayer2));
        const potentialLossPlayer2 = Math.round(kFactor * (0 - expectedScorePlayer2));
        // console.log(`potentialGainPlayer1: ${potentialGainPlayer1}`)
        // console.log(`potentialLossPlayer1: ${potentialLossPlayer1}`)
        // console.log(`potentialGainPlayer2: ${potentialGainPlayer2}`)
        // console.log(`potentialLossPlayer2: ${potentialLossPlayer2}`)

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
        return this.queue.some(client => client.socket.data.user.username === username);
    }


    private async addUserToQueue(client: { socket: Socket, gameMode: string }, userInfo: User): Promise<void> {
        client.socket.data.user = userInfo;

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
            selectedPower: null,
            powerBarLevel: 0,
            lastPowerActivation: Date.now()
        };

        client.socket.data.playerInfo = playerInfo;
    }

    private resetUserGameStatus(username: string): void {
        this.userInGameMap.set(username, false);
    }

    private async handlePowerSelection(gameId: number, players: { socket: Socket }[]): Promise<string[]> {
        // Array to store the selected powers
        const selectedPowers: string[] = [];

        // Function to handle the power selection for a single player
        const selectPowerForPlayer = (player: { socket: Socket }, timeout: number): Promise<string> => {
            return new Promise((resolve) => {
                // Define the timeout function ahead of time so it can be cleared
                const timeoutFunction = () => {
                    player.socket.removeListener('powerSelected', selectionListener); // Remove the listener
                    resolve('Expand'); // Auto-select default power if none is selected
                };

                // Set up the timeout, but keep a reference so it can be cleared
                const timeoutId = setTimeout(timeoutFunction, timeout);

                // Listener for the 'powerSelected' event
                const selectionListener = (data: any) => {
                    console.log("inside selectionListener");
                    clearTimeout(timeoutId); // Clear the timeout
                    resolve(data.power); // Resolve with the selected power
                };

                // Attach the listener
                player.socket.once('powerSelected', selectionListener);
            });
        };

        // Initiate power selection for each player and wait for the results
        for (const player of players) {
            // Set timeout to 10 seconds or any other appropriate value
            const power = await Promise.race([selectPowerForPlayer(player, 10000)]);
            selectedPowers.push(power);
        }

        return selectedPowers;
    }


    private async startMatchmaking(): Promise<void> {
        while (this.queue.length >= 2) {
            // Find two players with the same game mode
            const index = this.findMatchingPlayerIndex();
            if (index === -1) break;

            const player1 = this.queue.splice(index, 1)[0];
            const player2 = this.queue.shift();

            if (!player1 || !player2) continue;

            this.userInGameMap.set(player1.socket.data.user.username, true);
            this.userInGameMap.set(player2.socket.data.user.username, true);

            const gameMode = player1.gameMode; // Store the game mode

            const newGame = await this.createGame(player1.socket, player2.socket, gameMode);
            const gameService = gameMode === 'powerpong' ? this.PowerPongGameService : this.classicGameService;

            const gameId = newGame.id;

            const eloChanges = await this.calculatePotentialEloChanges(player1.socket.data.user.id, player2.socket.data.user.id);

            // Update playerInfo with ELO changes
            const updatedPlayer1Info = { ...player1.socket.data.playerInfo, ...eloChanges.player1 };
            const updatedPlayer2Info = { ...player2.socket.data.playerInfo, ...eloChanges.player2 };

            const gamePlayerInfoMap = new Map<string, PlayerInfo>();
            gamePlayerInfoMap.set(player1.socket.data.user.username, updatedPlayer1Info);
            gamePlayerInfoMap.set(player2.socket.data.user.username, updatedPlayer2Info);

            this.playerInfoMap.set(gameId, gamePlayerInfoMap);

            player1.socket.join(gameId.toString());
            player2.socket.join(gameId.toString());
            console.log('%s player1 has joined %s room', player1.socket.data.user.username, gameId.toString())
            console.log('%s player2 has joined %s room', player2.socket.data.user.username, gameId.toString())

            player1.socket.emit('matchFound', { opponent: player2.socket.data.user, gameId, gameMode: player1.gameMode });
            player2.socket.emit('matchFound', { opponent: player1.socket.data.user, gameId, gameMode: player1.gameMode });

            gameService.updateGameState(gameId, this.playerInfoMap.get(gameId), (data) => {
                this.server.to(gameId.toString()).emit('updateGameData', {
                    ...data,
                });

                if (data.isGameOver && data.winnerUsername && data.loserUsername) {
                    // console.log("GameOver Data:", data);
                    this.resetUserGameStatus(player1.socket.data.user.username);
                    this.resetUserGameStatus(player2.socket.data.user.username);
                    player1.socket.leave(gameId.toString());
                    player2.socket.leave(gameId.toString());
                    this.playerInfoMap.delete(player1.socket.data.user.username);
                    this.playerInfoMap.delete(player2.socket.data.user.username);
                    this.userCurrentGameMap.delete(player1.socket.data.user.username);
                    this.userCurrentGameMap.delete(player2.socket.data.user.username);
                    this.handleGameOver(data.winnerUsername, data.loserUsername, gameId).catch((error) => {
                        console.error('Error handling game over:', error);
                    });
                }
            });

            console.log(`Matched ${player1.socket.data.user.username} with ${player2.socket.data.user.username}`);
        }
    }

    private findMatchingPlayerIndex(): number {
        for (let i = 1; i < this.queue.length; i++) {
            if (this.queue[0].gameMode === this.queue[i].gameMode) {
                return i;
            }
        }
        return -1;
    }

    // private async createGame(player1: Socket, player2: Socket): Promise<Game> {
    private async createGame(player1: Socket, player2: Socket, gameMode: string): Promise<Game> {
        // Implement the logic to create a new game instance
        // This could involve creating a record in the database, initializing game state, etc.
        // For example, using a Prisma client:
        const newGame = await this.prisma.game.create({
            data: {
                // Define the data needed to create a new game
                uniqueId: uuidv4(),
                player1Id: player1.data.user.id,
                player2Id: player2.data.user.id,
                gameMode: gameMode, // Include the gameMode field
                // Other game-related data...
            }
        });

        this.userCurrentGameMap.set(player1.data.user.username, {
            gameId: newGame.id,
            gameMode: gameMode,
        });
        this.userCurrentGameMap.set(player2.data.user.username, {
            gameId: newGame.id,
            gameMode: gameMode,
        });
        return newGame;
    }

    // private getCurrentGameIdForUser(username: string): number | null {
    //     return this.userCurrentGameMap.get(username) || null;
    // }

    @SubscribeMessage('enterMatchmaking')
    async handleEnterMatchmaking(client: Socket, payload: { gameMode: string }) {

        const userInfo = await this.verifyTokenAndGetUserInfo(client);
        if (!userInfo) {
            client.disconnect(true); // Disconnect if no valid token
            return;
        }

        if (this.isUserInQueue(userInfo.username)) {
            console.log('User already in queue');
            return;
        }

        this.addUserToQueue({ socket: client, gameMode: payload.gameMode }, userInfo);

        if (this.queue.length >= 2) {
            this.startMatchmaking();
        }
    }

    @SubscribeMessage('playerActions')
    handlePlayerActions(client: Socket, activeKeys: string[]) {
        if (!client.data || !client.data.user) {
            console.error('User data is not available in handlePlayerActions');
            return;
        }

        const playerUsername = client.data.user.username;

        if (!playerUsername) {
            console.error('Player username is not available in handlePlayerActions');
            return;
        }

        const userGameInfo = this.userCurrentGameMap.get(playerUsername);
        const gameId = userGameInfo.gameId || null; // Extract gameId from the userGameInfo object
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
        this.classicGameService.isGamePaused = true;
    }

    @SubscribeMessage('resumeGame')
    handleResumeGame(client: Socket) {
        this.classicGameService.isGamePaused = false;
    }

    @SubscribeMessage('checkGameStatus')
    async handleCheckGameStatus(client: Socket): Promise<void> {
        const userInfo = await this.verifyTokenAndGetUserInfo(client);
        if (!userInfo) {
            client.emit('gameStatusResponse', { inGame: false });
            return;
        }

        const userGameData = this.userCurrentGameMap.get(userInfo.username);
        const inGame = !!userGameData;
        const gameId = inGame ? userGameData.gameId : null;
        const gameMode = inGame ? userGameData.gameMode : null;

        client.emit('gameStatusResponse', { inGame, gameId, gameMode });
    }

    @SubscribeMessage('attemptReconnect')
    async handleAttemptReconnect(client: Socket, payload: { username: string; gameId: string }): Promise<void> {
        client.join(payload.gameId.toString());
    }
}
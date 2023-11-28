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

    constructor(private gameService: SquareGameService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private prisma: PrismaService // Inject Prisma service here

    ) { }

    private addUserToQueue(client: Socket) {
        this.queue.push(client);
    }

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

            // const index = this.queue.indexOf(client);
            // if (index !== -1) {
            //     this.queue.splice(index, 1);
            // }

            // this.playerInfoMap.delete(client.data.user.sub);
        });
    }

    @SubscribeMessage('leaveMatchmaking')
    handleLeaveMatchmaking(client: Socket) {
        console.log("handleLeaveMatchmaking");
        this.removeFromQueue(client);
        // client.disconnect();
        if (client.data?.user?.username) {
            this.playerInfoMap.delete(client.data.user.username);
            console.log(`Removed ${client.data.user.username} from playerInfoMap`);
        }
        // client.disconnect(true);
    }

    @SubscribeMessage('enterMatchmaking')
    async handleEnterMatchmaking(client: Socket) {
        const token = client.handshake.headers.cookie?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

        if (!token) {
            console.log('No token provided from enterMatchmaking');
            // client.disconnect(true);  // Disconnect the client
            return;
        } // check if the token is auth

        try {
            const decoded = this.jwtService.verify(token);
            // Optionally, store the decoded data on the socket for future use
            client.data.user = decoded;
            const userInfo = await this.userService.getUserByToken(token);
            console.log("decoded.email = ", decoded.email);

            this.addUserToQueue(client);
            client.data.user.username = userInfo.username;

            const playerInfo: PlayerInfo = {
                // id: client.data.user.sub, // or appropriate user ID
                // username: client.data.user.username,
                username: userInfo.username,
                score: 0,
                activeKeys: []
            };

            // this.playerInfoMap.set(client.data.user.username, playerInfo);
            this.playerInfoMap.set(client.data.user.username, playerInfo);

            console.log("Queue length: ", this.queue.length);
            console.log("Queue contents: ", this.queue.map(client => `ID: ${client.id}, Username: ${client.data.user.username}`));


            if (this.queue.length >= 2) {  // if there are at least two users in the queue
                const player1 = this.queue.shift();  // remove the first user from the queue
                const player2 = this.queue.shift();  // remove the second user from the queue

                // console.log("\n\n\nplayer1: \n\n\n", player1);
                // console.log("\n\n\nplayer2: \n\n\n", player2);
                console.log("Player 1 Socket ID:", player1.id);
                console.log("Player 2 Socket ID:", player2.id);

                // console.log("player1.data.user.id = ", player1.data.user.sub);
                // console.log("player2.data.user.id = ", player2.data.user.sub);
                // console.log("player1.data.user.username = ", player1.data.user.username);
                // console.log("player2.data.user.username = ", player2.data.user.username);

                //this "sub" shit is so annoying and so random need to change that garbage ass shit

                const newGame = await this.prisma.game.create({
                    data: {
                        uniqueId: uuidv4(), // Generate a UUID for uniqueId
                        player1Id: player1.data.user.sub,
                        // player1Id: player1.data.user.id,
                        player2Id: player2.data.user.sub,
                        // player2Id: player2.data.user.id,
                        // other game data if necessary
                    }
                });

                const gameId = newGame.id;

                console.log("gameId:", gameId);

                player1.join(gameId.toString());
                player2.join(gameId.toString());

                // Notify both users that a match has been found

                player1.emit('matchFound', { opponent: player2.data.user, gameId });
                player2.emit('matchFound', { opponent: player1.data.user, gameId });

                this.gameService.updateGameState(gameId, this.playerInfoMap, (data) => {
                    this.server.to(gameId.toString()).emit('updateGameData', {
                        ...data,
                    });


                    if (data.isGameOver && data.winnerUsername) {
                        this.handleGameOver(data.winnerUsername, gameId).catch((error) => {
                            console.error('Error handling game over:', error);
                            // Handle any errors that occur in the game over handling
                        });
                    }
                });

                console.log(`Matched ${player1.id} with ${player2.id}`);
            }

        } catch (e) {
            console.log('Invalid token', e);
            client.disconnect(true);  // Disconnect the client
            return;
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

}

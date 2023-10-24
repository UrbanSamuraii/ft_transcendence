import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SquareGameService } from './game.square.service';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from '@nestjs/common';
import { UserService } from '../user/user.service';

const clientInputs = {};

@WebSocketGateway(3002, {
    cors: {
        origin: ["http://made-f0br8s11:3000", "http://localhost:3000", "*"], // allowed origins
        methods: ["GET", "POST"], // allowed methods
        credentials: true, // enable credentials
    },
})
export class GameGateway implements OnGatewayInit {
    @WebSocketServer() server: Server;
    private queue: Socket[] = [];
    private gameLoop: NodeJS.Timeout;

    constructor(private gameService: SquareGameService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) { }

    private addUserToQueue(client: Socket) {
        this.queue.push(client);
    }

    afterInit(server: Server) {
        console.log('Socket.io initialized');
        this.gameService.updateGameState(clientInputs, (data) => {
            this.server.emit('updateGameData', data);
        });
    }

    async handleConnection(client: Socket, ...args: any[]) {
        const token = client.handshake.headers.cookie?.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];

        if (!token) {
            console.log('No token provided');
            client.disconnect(true);  // Disconnect the client
            return;
        }

        // const isUserInQueue = (userEmail: string) => {
        //     return this.queue.some(client => client.data.user.email === userEmail);
        // };

        const userIndexInQueue = (userEmail: string) => {
            return this.queue.findIndex(client => client.data.user.email === userEmail);
        };

        try {
            const decoded = this.jwtService.verify(token);
            // Optionally, store the decoded data on the socket for future use
            client.data.user = decoded;
            const userInfo = await this.userService.getUserByToken(token);
            console.log("decoded.email = ", decoded.email);
            // console.log("client.data.user.id = ", client.data.user.email);
            console.log(this.queue.length);

            // if (!isUserInQueue(decoded.email)) {
            //     console.log("here");
            //     this.addUserToQueue(client);
            // }

            const index = userIndexInQueue(decoded.email);
            // if (index !== -1) {
            // console.log("Replacing user's old socket with new socket:", decoded.email);
            // this.queue[index] = client;  // Replace the old socket with the new one
            // } else {
            // console.log("Adding new user to queue:", decoded.email);
            this.addUserToQueue(client);
            // }

            console.log('Client connected:', client.id);
            // console.log(userInfo);

            console.log(this.queue.length);
            if (this.queue.length >= 2) {  // if there are at least two users in the queue
                const player1 = this.queue.shift();  // remove the first user from the queue
                const player2 = this.queue.shift();  // remove the second user from the queue

                // Notify both users that a match has been found
                player1.emit('matchFound', { opponent: player2.data.user });
                player1.emit('matchFound', { you: player1.data.user });
                player2.emit('matchFound', { opponent: player1.data.user });
                player2.emit('matchFound', { you: player2.data.user });

                // Here you could initialize game-related data or perform any other setup for the matched game

                console.log(`Matched ${player1.id} with ${player2.id}`);
            }

        } catch (e) {
            console.log('Invalid token', e);
            client.disconnect(true);  // Disconnect the client
            return;
        }

        // Listen for disconnect
        client.on('disconnect', (reason) => {
            // console.log('Client disconnected:', client.id);
            console.log('Client disconnected:', client.id, 'Reason:', reason);

            const index = this.queue.indexOf(client);
            if (index !== -1) {
                this.queue.splice(index, 1);
            }

            delete clientInputs[client.id];
        });
    }

    @SubscribeMessage('paddleMovements')
    handlePaddleMovements(client: Socket, activeKeys: string[]) {
        const clientId = client.id;
        clientInputs[clientId] = activeKeys;

    }

    @SubscribeMessage('pauseGame')
    handlePauseGame(client: Socket) {
        this.gameService.isGamePaused = true;
    }

    @SubscribeMessage('resumeGame')
    handleResumeGame(client: Socket) {
        this.gameService.isGamePaused = false;
    }

    @SubscribeMessage('startGame')
    handleStartGame(client: Socket) {
        const userId = client.data.user.userId;
        const sub = client.data.user.sub;
        const email = client.data.user.email;

        // console.log("userId = ", userId);
        // console.log("sub = ", sub);
        // console.log("email = ", email);
        console.log(JSON.stringify(client.data.user, null, 2));

        if (this.gameService.isGameOver) {
            this.gameService.resetGame();
        }
    }
}

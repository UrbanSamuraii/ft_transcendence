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

    private gameLoop: NodeJS.Timeout;

    constructor(private gameService: SquareGameService,
        private readonly jwtService: JwtService,  // <-- Inject the JwtService
        private readonly userService: UserService // <-- Inject the UserService
    ) { }  // <-- Inject the service

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

        // Validate the token
        try {
            const decoded = this.jwtService.verify(token);
            // Optionally, store the decoded data on the socket for future use
            client.data.user = decoded;
            const userInfo = await this.userService.getUserByToken(token);
            console.log(userInfo);

        } catch (e) {
            console.log('Invalid token', e);
            client.disconnect(true);  // Disconnect the client
            return;
        }

        console.log('Client connected:', client.id);

        // Listen for disconnect
        client.on('disconnect', () => {
            console.log('Client disconnected:', client.id);
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

import { OnModuleInit } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SquareGameService } from './game.square.service';

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

    constructor(private gameService: SquareGameService) { }  // <-- Inject the service

    afterInit(server: Server) {
        console.log('Socket.io initialized');
        this.gameService.updateGameState(clientInputs, (data) => {
            this.server.emit('updateGameData', data);
        });
    }

    handleConnection(client: Socket) {
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
        if (this.gameService.isGameOver) {
            this.gameService.resetGame();
        }
    }
}

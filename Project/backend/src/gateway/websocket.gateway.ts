import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection } from "@nestjs/websockets";
import { Response as ExpressResponse } from 'express';
import { Res, Req } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from "@nestjs/event-emitter";
import { UserService } from "src/user/user.service";
import { GatewaySessionManager } from "./gateway.session";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000", "*"],
		methods: ["GET", "POST"],
        credentials: true,
	}
})

export class MessagingGateway implements OnGatewayConnection{
	constructor(private readonly userService: UserService,
		private readonly sessionManager: GatewaySessionManager) {}
	
	// From OnGatewayConnection : a method that will be executed when a new WebSocket connection is established
	async handleConnection(client:Socket, ...args: any[]) {
		console.log("New incoming connection !");
		const cookie  = client.handshake.headers.cookie;
		const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
		if (!token) {
            console.log('No token provided');
            client.disconnect(true);
            return;
        }
		const userId = this.extractUserIdFromSocket(client);
		const identifiedUser = await this.userService.getUserByToken(token);
		if (userId) {
			this.sessionManager.setUserSocket(userId, client);
		}
		client.emit('connected', { status: 'GOOD CONNEXION ESTABLISHED'});
	}

	private extractUserIdFromSocket(socket: Socket): string | null {
		const userId = socket.id;
		return userId ? userId : null;
	}
	

	// To inject the WebSocket server instance provided by socket.io
	@WebSocketServer() server: Server;

	// To define methods that handle specific WebSocket events.
	// The client send a message to the server : "socket.emit('createMessage', { OBJET });"
	@SubscribeMessage('createMessage')
	handleCreateMessage(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		console.log({"REQ handling creation of the message": req});
		console.log('Create Message');
	}

	// Can be triggered from various parts of the application - not necessary a websocket event
	// When user will create a message -> "this.eventEmitter.emit('message.create', message);"
	@OnEvent('message.create')
	handleMessageCreatedEvent(payload: any) {
		console.log({"Message created in PAYLOAD": payload});
		this.server.emit('onMessage', payload)
	}

}

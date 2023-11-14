import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection } from "@nestjs/websockets";
import { Response as ExpressResponse } from 'express';
import { Res, Req } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from "@nestjs/event-emitter";
import { UserService } from "src/user/user.service";
import { GatewaySessionManager } from "./gateway.session";
import { AuthenticatedSocket } from "../utils/interfaces";
import { User } from "@prisma/client";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000", "*"],
		methods: ["GET", "POST"],
        credentials: true,
	}
})

export class MessagingGateway implements OnGatewayConnection{
	constructor(private readonly userService: UserService,
		private readonly sessions: GatewaySessionManager) {}
	
	// From OnGatewayConnection : a method that will be executed when a new WebSocket connection is established
	async handleConnection(client:AuthenticatedSocket, ...args: any[]) {
		console.log("New incoming connection !");
		const cookie  = client.handshake.headers.cookie;
		const token = cookie.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
		if (!token) {
            console.log('No token provided');
            client.disconnect(true);
            return;
        }

		const identifiedUser = await this.userService.getUserByToken(token);
		if (identifiedUser) {
			client = this.associateUserToAuthSocket(client, identifiedUser);
			this.sessions.setUserSocket(identifiedUser.id, client);
		}
		console.log({"SOCKET id of our user": client.id});
		console.log({"SOCKET ASSOCIATED USER": client.user});
		console.log({"SESSIONS": this.sessions});
		client.emit('connected', { status: 'GOOD CONNEXION ESTABLISHED'});
	}

	////////////////////// PRIVATE METHODE //////////////////////
	
	private associateUserToAuthSocket(socket: AuthenticatedSocket, identifiedUser:User ): AuthenticatedSocket {
		socket.user = identifiedUser;
		return socket;
	}

	private extractUserIdFromSocket(socket: AuthenticatedSocket): Number | null {
		const userId = socket.user.id;
		return userId ? userId : null;
	}

	//////////////////////////////////////////////////////////////
	
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
		if (payload.author) {
			const authorSocket = this.sessions.getUserSocket(payload.author.id);
			const recipientSockets = this.sessions.getSockets();
			// console.log({"AUTHOR SOCKET": authorSocket});
			
			recipientSockets.forEach((recipientSocket, userId) => {
				if (userId !== payload.author.id) {
					// console.log({"RECIPIENT SOCKET": recipientSocket});
					recipientSocket.emit('onMessage', payload);
				}
			});
			authorSocket.emit('onMessage', payload);
			// this.server.emit('onMessage', "update");
		}
		else {
			this.server.emit('onMessage', payload); // VA FALOIR FEINTER
		}
	}
}

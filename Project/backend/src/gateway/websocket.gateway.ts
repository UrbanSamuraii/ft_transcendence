import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection } from "@nestjs/websockets";
import { Response as ExpressResponse } from 'express';
import { Res, Req } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from "@nestjs/event-emitter";
import { UserService } from "src/user/user.service";
import { MembersService } from "src/members/members.service";
import { GatewaySessionManager } from "./gateway.session";
import { AuthenticatedSocket } from "../utils/interfaces";
import { User } from "@prisma/client";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000", "*"],
		methods: ["GET", "POST", "DELETE"],
        credentials: true,
	}
})

export class MessagingGateway implements OnGatewayConnection{
	constructor(private readonly userService: UserService,
		private readonly memberService: MembersService,
		private readonly sessions: GatewaySessionManager) {}
	
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

		// To make my userSocket join all the room the user is member of
		const userWithConversations = await this.memberService.getMemberWithConversationsHeIsMemberOf(identifiedUser);
		for (const conversation of userWithConversations.conversations) {
			client.join(conversation.id.toString());
		}

		console.log({"SOCKET id of our user": client.id});
		client.emit('connected', { status: 'GOOD CONNEXION ESTABLISHED'});

		client.on('disconnect', (reason) => {
            console.log('Client disconnected:', client.id, 'Reason:', reason);
			if (reason === 'transport close') {
				client.disconnect();
				client = null;
			}
        });
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

	@OnEvent('join.room')
	joinSpecificConversation(user: User, conversationId: number) {
		const userSocket = this.sessions.getUserSocket(user.id);
		userSocket.join(conversationId.toString());
		console.log({"User socket connected to the room !": userSocket.id});
	}

	@OnEvent('leave.room')
	leaveSpecificConversation(user: User, conversationId: number) {
		const userSocket = this.sessions.getUserSocket(user.id);
		userSocket.leave(conversationId.toString());
		console.log({"User socket left to the room !": userSocket.id});
	}

	@OnEvent('message.create')
	async handleMessageCreatedEvent(payload: any) {
		if (payload.author) {
			const isMute = await this.memberService.isMuteMember(payload.conversation_id, payload.author.id);
			console.log({"Mute author ?": isMute});
			if (isMute === false) {
				console.log("SENDING MESSAGE");
				this.server.to(payload.conversation_id.toString()).emit('onMessage', payload); }
		}
		else {
			this.server.emit('onMessage', payload); // WHEN CREATING THE CONVERSATION - 
		}
	}

	@OnEvent('message.deleted')
	handleMessageDeletedEvent(payload: any) {
		console.log({"When deleting a message": payload});
		if (payload.author) {
			const authorSocket = this.sessions.getUserSocket(payload.author.id);
			const recipientSockets = this.sessions.getSockets();
			
			recipientSockets.forEach((recipientSocket, userId) => {
				if (userId !== payload.author.id && recipientSocket) {
					recipientSocket.emit('onDeleteMessage', payload);
				}
			});
			if (authorSocket) authorSocket.emit('onDeleteMessage', payload);
		}
		else {
			this.server.emit('onDeleteMessage', payload); // WHEN CREATING THE CONVERSATION - 
		}
	}
}

import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection } from "@nestjs/websockets";
import { Response as ExpressResponse } from 'express';
import { Res, Req } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000", "*"],
		methods: ["GET", "POST"],
        credentials: true,
	}
})

export class MessagingGateway implements OnGatewayConnection{
	
	// From OnGatewayConnection : a method that will be executed when a new WebSocket connection is established
	handleConnection(client:Socket, ...args: any[]) {
		console.log("New incoming connection !");
		console.log(client.id);
		client.emit('connected', { status: 'GOOD CONNEXION ESTABLISHED'});
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

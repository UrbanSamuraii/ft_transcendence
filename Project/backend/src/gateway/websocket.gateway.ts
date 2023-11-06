import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit, OnGatewayConnection } from "@nestjs/websockets";
import { Response as ExpressResponse } from 'express';
import { Res, Req } from '@nestjs/common';
import { Server } from 'socket.io';
import { OnEvent } from "@nestjs/event-emitter";

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000", "*"],
		methods: ["GET", "POST"],
        credentials: true,
	}
})

export class MessagingGateway implements OnGatewayConnection{
	
	handleConnection(client:any, ...args: any[]) {
		// console.log(client);
	}

	@WebSocketServer() server: Server;

	@SubscribeMessage('createMessage')
	handleCreateMessage(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		console.log({"REQ handling creation of the message": req});
		console.log('Create Message');
	}

	@OnEvent('message.create')
	handleMessageCreatedEvent(payload: any) {
		console.log({"Message created in PAYLOAD": payload});
		this.server.emit('onMessage', payload)
	}
}

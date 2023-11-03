import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayInit } from "@nestjs/websockets";
import { Response as ExpressResponse } from 'express';
import { Res, Req } from '@nestjs/common';
import { Server } from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: ["http://localhost:3000", "*"],
		methods: ["GET", "POST"],
        credentials: true,
	}
})
export class MessagingGateway implements OnGatewayInit{
	@WebSocketServer() server: Server;

	@SubscribeMessage('createMessage')
	handleCreateMessage(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		console.log('Create Message');
	}

}

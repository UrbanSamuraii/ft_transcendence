// import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
// import { ServerToClientEvents, ClientToServerEvents, Message } from '../../shared/interfaces/chat.interface';
// import { Server } from 'socket.io';
  
//   @WebSocketGateway({
// 	cors: {
// 	  origin: [ "http://localhost:3000", "*" ],
// 	},
//   })
//   export class ChatGateway {
// 	@WebSocketServer() server: Server = new Server<
// 	  ServerToClientEvents,
// 	  ClientToServerEvents
// 	>();
// 	private logger = new Logger('ChatGateway');	// To log chat messages coming into the server from clients
  
// 	@SubscribeMessage('chat')
// 	async handleEvent( @MessageBody() payload: Message ): Promise<Message> {
// 	  this.logger.log(payload);
// 	  this.server.emit('chat', payload); // broadcast messages
// 	  return payload;
// 	}
//   }
  
import { Module, UseGuards } from "@nestjs/common";
import { MessagingGateway } from "./websocket.gateway";
import { GatewaySessionManager } from "./gateway.session";
import { ChatWebSocketGuard } from './gateway.guard'

@Module({
	providers: [MessagingGateway, {
		provide : GatewaySessionManager,
		useClass: GatewaySessionManager
	}]
})

@UseGuards(ChatWebSocketGuard)
export class GatewayModule {}


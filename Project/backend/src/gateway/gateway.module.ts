import { Module } from "@nestjs/common";
import { MessagingGateway } from "./websocket.gateway";
import { GatewaySessionManager } from "./gateway.session";

@Module({
	providers: [MessagingGateway, {
		provide : GatewaySessionManager,
		useClass: GatewaySessionManager
	}]
})
export class GatewayModule {}


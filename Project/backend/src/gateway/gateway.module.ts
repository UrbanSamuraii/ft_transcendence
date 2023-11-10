import { Module } from "@nestjs/common";
import { MessagingGateway } from "./websocket.gateway";
import { GatewaySessionManager } from "./gateway.session";

@Module({
	providers: [MessagingGateway, GatewaySessionManager]
})
export class GatewayModule {}


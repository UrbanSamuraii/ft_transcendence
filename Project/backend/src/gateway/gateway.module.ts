import { Module, UseGuards } from "@nestjs/common";
import { MessagingGateway } from "./websocket.gateway";
import { GatewaySessionManager } from "./gateway.session";
import { UserModule } from "../user/user.module";
import { MembersModule } from "../members/members.module"; 

@Module({
	imports: [UserModule, MembersModule],
	providers: [MessagingGateway, {
		provide : GatewaySessionManager,
		useClass: GatewaySessionManager
	}]
})

export class GatewayModule {}

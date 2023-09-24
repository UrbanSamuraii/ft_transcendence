import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy, Jwt2faStrategy } from "./strategy";

@Module({
	imports: [JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, Jwt2faStrategy],
})
export class AuthModule {}
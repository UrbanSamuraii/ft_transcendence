import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { Jwt2faStrategy } from "./strategy";
import { Auth42Strategy } from "./strategy";
import { UserService } from "src/user/user.service";
import passport from "passport";
import { PassportModule } from "@nestjs/passport";

@Module({
	imports: [PassportModule.register({defaultStrategy: 'jwt', session:false}),
		PassportModule.register({defaultStrategy: 'jwt-2fa', session:false}),
		JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, Auth42Strategy, UserService, Jwt2faStrategy],
})
export class AuthModule {}
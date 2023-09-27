import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "../prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy";
import { Auth42Strategy } from "./strategy";
import { UserService } from "src/user/user.service";

@Module({
	imports: [JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, Auth42Strategy, UserService],
})
export class AuthModule {}
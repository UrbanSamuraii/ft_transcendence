// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from "@nestjs/config";
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { UserService } from '../../user/user.service';
// import { PrismaService } from "../../prisma/prisma.service";

// @Injectable()
// export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
// 	constructor(private config: ConfigService, private readonly userService: UserService, private prisma: PrismaService) {
// 		super({
// 		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
// 		secretOrKey: config.get('JWT_2FA_SECRET'),
// 		});
// 	}

// 	async validate(payload: { sub: number, email: string, isTwoFactorAuthenticated: boolean }) 
// 	{
// 		const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
// 		if (!user.two_factor_activate) {
// 			delete user.hash;
// 			return user;
// 		}
// 		if (payload.isTwoFactorAuthenticated) {
// 			delete user.hash;
// 			return user;
// 		}
// 	}
// }
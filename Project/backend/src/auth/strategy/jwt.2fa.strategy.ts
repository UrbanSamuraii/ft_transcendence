import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from "@nestjs/config";
import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
	constructor(private readonly prisma: PrismaService, private config: ConfigService) {
		super({
		jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
		secretOrKey: config.get('JWT_2FA_SECRET'),
		});
	}

	async validate(payload: any) {
		const user = await this.prisma.user.findUnique({
			where: { email: payload.email }, 
		});

		if (!user.two_factor_activate) {
		return user;
		}
		if (payload.isTwoFactorAuthenticated) {
		return user;
		}
	}
}
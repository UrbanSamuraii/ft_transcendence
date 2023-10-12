import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from "@nestjs/config";
import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { Request } from 'express'; // Import Request from express

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
	constructor(private readonly prisma: PrismaService, private config: ConfigService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				Jwt2faStrategy.extractJWTFromCookie,
				ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to header if cookie doesn't contain token
			]),
			ignoreExpiration: true,
			secretOrKey: config.get('JWT_2FA_SECRET'),
		});
	}

	private static extractJWTFromCookie(req: Request) {
		console.log({"JWT 2FA REQUEST": req});
		if (req.cookies) {
			return req.cookies.token;
		}
		return null;
	}

	async validate(payload: any) {
		const user = await this.prisma.user.findUnique({
			where: { email: payload.email },
		});
		console.log({ "USER IN STRATEGY": user });
		console.log({"2fa payload from strategy": payload});
		if (!user.is_two_factor_activate) {
			console.log("!user.is_two_factor_activate");
			return user;
			// return payload;
		}
		if (payload.isTwoFactorAuthenticated) {
			console.log("isTwoFactorAuthenticated");
			return user; 
			// return payload;
		}
	}
}
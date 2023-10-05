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
			secretOrKey: config.get('JWT_2FA_SECRET'),
		});
	}

	// Custom extractor to get JWT from cookie
	private static extractJWTFromCookie(req: Request) {
		console.log("req.cookies.token =", req.cookies.token);
		if (req.cookies) {
			return req.cookies.token;
		}
		return null;
	}

	async validate(payload: any) {
		const user = await this.prisma.user.findUnique({
			where: { email: payload.email },
		});

		if (!user.two_factor_activate) {
			// return user;
			return payload;
		}
		if (payload.isTwoFactorAuthenticated) {
			// return user; 
			return payload;
		}
	}
}
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { TokenPayload } from '../entities/token-payload.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') 
{
	constructor (private config: ConfigService, private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWTFromCookie,
				ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to header if cookie doesn't contain token
			  ]),
			secretOrKey: config.get('JWT_2FA_SECRET'),
		  });
	}

	private static extractJWTFromCookie(req: Request) {
		if (req.cookies) {
			return req.cookies.token;
		}
		return null;
	}	

	async validate(payload: TokenPayload) {
		console.log({ "TOKEN_PAYLOAD ": payload });
		return payload;
	}
}
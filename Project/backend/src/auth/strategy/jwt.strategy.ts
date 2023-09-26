import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') 
{
	constructor (private config: ConfigService, private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWTFromCookie,
			  ]),
			secretOrKey: config.get('JWT_SECRET'),
		  });
	}

	private static extractJWTFromCookie(req: Request) {
		if (req.cookies && req.cookies.access_token) {
			return req.cookies.access_token;
		}
		return null;
	}	
	
	async validate(payload: { sub: number, email: string }) {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
		});
		delete user.hash;
		return user;
	}
}
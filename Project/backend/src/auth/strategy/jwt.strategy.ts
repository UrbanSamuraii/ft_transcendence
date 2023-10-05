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
				ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to header if cookie doesn't contain token
			  ]),
			secretOrKey: config.get('JWT_SECRET'),
		  });
	}

	// Custom extractor to get JWT from cookie
	private static extractJWTFromCookie(req: Request) {
		console.log({ "COOKIE :": req.cookies });
		if (req.cookies) {
			return req.cookies.token;
		}
		return null;
	}	
	
	// async validate(payload: { sub: number, email: string }) {
	// 	const user = await this.prisma.user.findUnique({
	// 		where: { id: payload.sub },
	// 	});
	// 	delete user.hash;
	// 	return user;
	// }

	async validate(payload: any) {
		return payload;
	}
}
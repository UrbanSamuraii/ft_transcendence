import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport"
import { log } from "console";
import { Strategy, ExtractJwt } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') 
{
	constructor (config: ConfigService, private prisma: PrismaService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('JWT_SECRET'),
		  });
	}

	// this validate function is there to append the payload to the user object of the request object
	// To summerize, it seems that my user is now identified as payload data structure in Request
	async validate(payload: { 
		sub: number; 
		email: string;
	}) {
		// console.log({ payload: payload});
		const user = await this.prisma.user.findUnique({
			where: {
				id: payload.sub,
			},
		});
		delete user.hash;
		return user;
	}
}
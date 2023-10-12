import { ConsoleLogger, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport"
import { Request } from "express";
import { Strategy, ExtractJwt } from "passport-jwt";
import { TokenPayload } from '../entities/token-payload.entity';
import { UserService } from "src/user/user.service";
import { AuthService } from "../auth.service";
import { PrismaService } from "../../prisma/prisma.service";
import { catchError } from "rxjs";



@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') 
{
	constructor (private config: ConfigService, 
		private userService: UserService,
		private readonly prisma: PrismaService,
		private authService: AuthService) {
		
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				JwtStrategy.extractJWTFromCookie,
				ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback to header if cookie doesn't contain token
			  ]),
			secretOrKey: config.get('JWT_2FA_SECRET'),
		  });
	}

	private static extractJWTFromCookie(req: Request) {
		console.log({"REQ JWT": req});
		if (req.cookies) {
			return req.cookies.token;
		}
		return null;
	}	

	async validate(payload: any) {
		console.log({"PAYLOAD VALIDATE LOGOUT": payload});
		const email = payload.email;
		const user = await this.userService.getUser({ email });
		delete user.hash;
		return user;
	  }
}
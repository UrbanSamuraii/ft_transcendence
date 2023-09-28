import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { AuthService } from "../auth.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy, '42')
{
	constructor (private config: ConfigService, private authService: AuthService) {
		super({
			clientID: config.get('UID_42_API'),
   			clientSecret: config.get('SECRET_42_API'),
			callbackURL: 'http://localhost:4000/auth/sign42',
			// profileFields: ['id', 'login', 'last_name', 'first_name', 'email', 'image_url'],
			scope: 'public',
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		// console.log(profile);
		return done(null, profile);
	}
}
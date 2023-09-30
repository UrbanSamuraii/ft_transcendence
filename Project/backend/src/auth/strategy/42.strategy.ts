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
			callbackURL: 'http://localhost:3001/auth/sign42',
			// callbackURL: config.get('CALL_BACK_URL_42_API'),
			// profileFields: ['id', 'login', 'last_name', 'first_name', 'email', 'image_url'],
			scope: 'public',
		})
	}

	async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
		return done(null, profile);
	}
}

// from 42 api
// https://api.intra.42.fr/oauth/authorize?
	// client_id=u-s4t2ud-3ae42a7ee6b51082733d85b4b858c91b25edbc64b252a6ee8cef001d91056b0b&
	// redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fsign42&
	// response_type=code

// from yours
// https://api.intra.42.fr/oauth/authorize?
	// response_type=code&
	// redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fauth%2Fsign42&
	// scope=public&
	// client_id=u-s4t2ud-9fc8db088c15939d30220f43e8da699b6eb76aeaab4df25c354d9ac3a9c66293
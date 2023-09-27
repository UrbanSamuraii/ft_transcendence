import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-42';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy, '42')
{
	constructor (private config: ConfigService, private prisma: PrismaService) {
		super({
			clientID: config.get('UID_42_API'),
   			clientSecret: config.get('SECRET_42_API'),
    		callbackURL: config.get('CALL_BACK_URL_42_API'),
			profileFields: [
				"id",
				"login",
				"last_name",
				"first_name",
				"email",
				"image_url",
			],
		})
	}

	async validate( access_token: string, refreshToken: string, profile: any, done: VerifyCallback ): Promise<any> {
		return done(null, profile);
	}
}
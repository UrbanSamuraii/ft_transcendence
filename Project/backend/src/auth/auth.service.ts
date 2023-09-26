import { Injectable, Request, Req, Res, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserService } from "src/user/user.service";
import * as cookie from 'cookie'; // Import the cookie library

@Injectable()
export class AuthService {

	constructor(private prisma: PrismaService, 
		private jwt:JwtService, 
		private config: ConfigService,
		private userService: UserService) {}

	async forty2signup(@Req() req: Request, @Res() res: any) {
		if (!req.user) {
            return "";
        }
	}
	
	async signup(dto: AuthDto, @Res() res: any) {
		const hash = await argon.hash(dto.password);
		try {
			const user = await this.prisma.user.create({
				data: {
					email: dto.email,
					username: dto.username,
					id42: Number(dto.id42),
					hash,
				},
			});
			const token = await this.signToken(user.id, user.email);
			// Set a cookie with the token in the response
			res.cookie('token', token, {
				httpOnly: true,
				secure: false,
				sameSite: 'lax',
				expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
			}).send({ status: 'ok' });
		}
		catch(error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') { throw new ForbiddenException('Credentials taken'); }}
			throw error;
		}
	}

	@HttpCode(HttpStatus.OK)
	async signin(dto: Partial<AuthDto>, @Res() res: any) {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email }
		});
		if (!user) {
			throw new ForbiddenException('Credentials incorrect : email');
		}
		const pwMatch = await argon.verify(user.hash, dto.password);
		if (!pwMatch) {
			throw new ForbiddenException('Credentials incorrect : password');
		}
		const token = await this.signToken(user.id, user.email);
		res.cookie('token', token, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
		}).send({ status: 'ok' });
	}

	async signToken(userID: number, email: string): Promise<{access_token: string}> {
		const payload = {
			sub: userID,
			email
		};
		const secret = this.config.get('JWT_SECRET');
		const token = await  this.jwt.signAsync(payload, {
			expiresIn: '1d',
			secret: secret,
		});
		return { access_token: token };
	}

	async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();
		const otpAuthUrl = authenticator.keyuri(
		  user.email,
		  'ft_transcendance',
		  secret,
		);
	
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
	
		return { secret, otpAuthUrl };
	}

	async generateQrCodeDataURL(otpAuthUrl: string) {
		return toDataURL(otpAuthUrl);
	}

	isTwoFactorAuthenticationCodeValid(two_factor_secret: string, user: User) {
		return authenticator.verify({ token: two_factor_secret, secret: user.two_factor_secret });
	}

	async loginWith2fa(userWithoutPsw: Partial<User>) {
		const payload = {
			email: userWithoutPsw.email,
			isTwoFactorAuthenticationEnabled: !!userWithoutPsw.two_factor_activate,
			isTwoFactorAuthenticated: true,
		};

		return {
			email: payload.email,
			access_token: this.jwt.sign(payload),
		};
	}
}
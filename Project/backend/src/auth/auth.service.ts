import { Injectable, Body, Res, Req, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import * as cookie from 'cookie'; // Import the cookie library

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
        private userService: UserService) { }

    async forty2signup(req: any, @Res() res: any) {
        try {
            if (!req.user) { return res.status(401).json({ message: "Unauthorized" }); }

            const id42 = Number(req.user.id);
            const email = req.user.emails[0]?.value || '';
            const username = req.user.username;
            const first_name = req.user.name.givenName;
            const last_name = req.user.name.familyName;
            const img_url = req.user.photos[0]?.value || '';

            const existingUser = await this.userService.getUser({ email });

            if (!existingUser) {
                const user = await this.userService.createUser({
                    id42,
                    email,
                    username,
                    first_name,
                    last_name,
                    img_url,
                });
                user.accessToken = await this.signToken(user.id, user.email);
                res.cookie('token', user.accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
                })
            }
            else {
                const user = await this.userService.getUser({ email });
                user.accessToken = await this.signToken(user.id, user.email);
                res.cookie('token', user.accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
                })
            }
            res.redirect('http://localhost:3000/play');
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken');
                }
                throw error;
            }
        }
    }

    async signup(@Req() req, @Res({ passthrough: true }) res: any) {
        const hash = await argon.hash(req.body.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: req.body.email,
                    username: req.body.username,
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    hash,
                },
            });
            user.accessToken = await this.signToken(user.id, user.email);
            console.log({"ACCESS_TOKEN from signup user": user.accessToken});
            res.status(200).cookie('token', user.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
            })
        	// res.status(201).json({ message: 'User created successfully', token: user.accessToken });
        }
        catch (error: any) { 
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					if (Array.isArray(error.meta?.target)) {
						if (error.meta.target.includes('email')) {
							res.status(400).json({ error: 'Email already exists' });
						} else if (error.meta.target.includes('username')) {
							res.status(400).json({ error: 'Username already exists' });
						}
					}
				}
			} else {
				res.status(500).json({ error: 'Internal server error' });
			}
		}
	}

    @HttpCode(HttpStatus.OK)
    async signin(@Body('email') email: string, @Body('password') password: string, @Res() res: any) {
        const user = await this.prisma.user.findUnique({
            where: { email: email }
        });
        if (!user) {
            throw new ForbiddenException('Credentials incorrect: email');
        }
        const pwMatch = await argon.verify(user.hash, password);
        if (!pwMatch) {
            throw new ForbiddenException('Credentials incorrect: password');
        }
        res.cookie('token', user.accessToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            expires: new Date(0), // Set the expiration date in the past
        });
        res.clearCookie('token');
        const token = await this.signToken(user.id, user.email);
        res.status(200).cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
        });
        // console.log( "Ready to play" );
        // res.status(200).json({ status: 'User is identified', accessToken: user.accessToken });
    }

    async signToken(userID: number, email: string): Promise<string> {
        const payload = {
            sub: userID,
            email
        };
        const secret = this.config.get('JWT_2FA_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: secret,
        });
        return token;
    }

	async loginWith2fa(userWithoutPsw: Partial<User>) {
		const payload = {
			email: userWithoutPsw.email,
			is_two_factor_activate: !!userWithoutPsw.is_two_factor_activate,
			isTwoFactorAuthenticated: true,
		};
		return {
			email: payload.email,
			token: this.jwt.sign(payload),
		};
	}

	async generateTwoFactorAuthenticationSecret(User: User) {
		// console.log({"USER ": User});
        const email = User.email;
        const user = await this.userService.getUser({ email }); 
        const secret = authenticator.generateSecret();
		const otpAuthUrl = authenticator.keyuri(user.email, this.config.get<string>('AUTH_APP_NAME') as string, secret);
        
		await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
	
		return { secret, otpAuthUrl }
	}

    async generateQrCodeDataURL(otpAuthUrl: string) {
        console.log({"OTP AuthUrl": otpAuthUrl});
        return toDataURL(otpAuthUrl);
    }

    generateTwoFactorAuthenticationToken(user: User) {
        // console.log(authenticator.generateSecret());
        return authenticator.generate(user.two_factor_secret);
    }

	// Method that will verify the authentication code with the user's secret
	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
		  token: twoFactorAuthenticationCode,
		  secret: user.two_factor_secret,
		});
	}

}
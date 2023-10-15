import { Injectable, Body, Res, Req, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Response as ExpressResponse } from 'express';
import { UserService } from "src/user/user.service";
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';

// import { pick } from 'lodash';
// import * as cookie from 'cookie'; // Import the cookie library

@Injectable()
export class AuthService {

    constructor(private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
        private userService: UserService) { }


    async signToken(userID: number, email: string): Promise<string> {
        const user = await this.userService.getUser({ email });
        const payload = {
            sub: userID,
            email,
            is_two_factor_activate: !!user.is_two_factor_activate,
            isTwoFactorAuthenticated: false,
        };
        const secret = this.config.get('JWT_2FA_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: secret,
        });
        return token;
    }

    async validateUser(email: string, pass: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: email }
        });
        if (!user) {
            throw new ForbiddenException('Credentials incorrect: email');
        }
        const pwMatch = await argon.verify(user.hash, pass);
        if (!pwMatch) {
            throw new ForbiddenException('Credentials incorrect: password');
        }
        const userWithoutPassword = { ...user };
        delete userWithoutPassword.hash;
        return userWithoutPassword;
    }

    async signup(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
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
            const accessToken = await this.signToken(user.id, user.email);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { accessToken: accessToken },
            });
            res.status(200).cookie('token', accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
            })
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

    async login(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
    const email = req.body.email;
    const user = await this.userService.getUser({ email });
    if (!user) {
        throw new ForbiddenException('Credentials incorrect: email');
    }
    const pwMatch = await argon.verify(user.hash, req.body.password);
    if (!pwMatch) {
        throw new ForbiddenException('Credentials incorrect: password');
    }
    else {
        // console.log({"OLD TOKEN BEFORE SIGNIN": user.accessToken});
        if (user.is_two_factor_activate) {
            return ({bool: true, mail: req.body.email, password: req.body.password});
        }
        else {
            const newToken = await this.signToken(user.id, user.email);
            await this.prisma.user.update({
                where: { id: user.id },
                data: { accessToken: newToken },
            });
            // console.log({"NEW TOKEN AFTER SIGNIN": user.accessToken});
            res.status(200).cookie('token', newToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
                })
           }
        }
    }

    async loginWith2FA(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
        const email = req.body.email;
        const user = await this.userService.getUser({ email });
        const isCodeValid = this.isTwoFactorAuthenticationCodeValid(
                    req.body.two_factor_athentication_password,
                    user,
        );
        if (!isCodeValid) {
            throw new ForbiddenException('Wrong authentication code');
        }
        const newToken = await this.sign2FAToken(user.id, user.email);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { accessToken: newToken },
        });
        res.status(200).cookie('2fatoken', newToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
        })
    }

    ///////////////////// 2FA settings /////////////////////

    async sign2FAToken(userID: number, email: string): Promise<string> {
        const user = await this.userService.getUser({ email });
        const payload = {
            sub: userID,
            email,
            is_two_factor_activate: !!user.is_two_factor_activate,
            isTwoFactorAuthenticated: true,
        };
        const secret = this.config.get('JWT_2FA_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '1d',
            secret: secret,
        });
        return token;
    }

    // Generate the "two_factor_secret" and Update our user in the database
    // Send back the secret and the otpAuthUrl
    async generateTwoFactorAuthenticationSecret(user: User) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(user.email, this.config.get<string>('AUTH_APP_NAME') as string, secret);
        await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);
            return { secret, otpAuthUrl };
    }

    // Annulate the "two_factor_secret" AND a new Token !
    // Update our user in the database
    // So when our User turn off this 2fa option -> new token based on traditionnal way to identify
    // async annulationOfTheTwoFactorAuthenticationSecret(user: User) {
    //     const secret = '';
    //     const new2FAToken = await this.signToken(user.id, user.email);
    //     await this.userService.setTwoFactorAuthenticationSecret(secret, user.id, new2FAToken);
    // }
    
    // Generate the Qr Code needed by our application
    async generateQrCodeDataURL(otpAuthUrl: string) {
        return toDataURL(otpAuthUrl); 
    }

    // Method that will verify the authentication code with the user's secret
	isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, user: User) {
		return authenticator.verify({
		  token: twoFactorAuthenticationCode,
		  secret: user.two_factor_secret,
		});
    }
}


    // async forty2signup(req: any, @Res() res: ExpressResponse) {
    //     try {
    //         if (!req.user) { return res.status(401).json({ message: "Unauthorized" }); }

    //         const id42 = Number(req.user.id);
    //         const email = req.user.emails[0]?.value || '';
    //         const username = req.user.username;
    //         const first_name = req.user.name.givenName;
    //         const last_name = req.user.name.familyName;
    //         const img_url = req.user.photos[0]?.value || '';

    //         const existingUser = await this.userService.getUser({ email });

    //         if (!existingUser) {
    //             const user = await this.userService.createUser({
    //                 id42,
    //                 email,
    //                 username,
    //                 first_name,
    //                 last_name,
    //                 img_url,
    //             });
    //             const accessToken = await this.signToken(user.id, user.email);
    //             await this.prisma.user.update({
    //                 where: { id: user.id },
    //                 data: { accessToken: accessToken },
    //             });
    //             res.cookie('token', accessToken, {
    //                 httpOnly: true,
    //                 secure: false,
    //                 sameSite: 'lax',
    //                 expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
    //             })
    //         }
    //         else {
    //             const user = await this.userService.getUser({ email });
    //             const accessToken = await this.signToken(user.id, user.email);
    //             await this.prisma.user.update({
    //                 where: { id: user.id },
    //                 data: { accessToken: accessToken },
    //             });
    //             res.cookie('token', accessToken, {
    //                 httpOnly: true,
    //                 secure: false,
    //                 sameSite: 'lax',
    //                 expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
    //             })
    //         }
    //         res.redirect('http://localhost:3000/play');
    //     }
    //     catch (error) {
    //         if (error instanceof PrismaClientKnownRequestError) {
    //             if (error.code === 'P2002') {
    //                 throw new ForbiddenException('Credentials taken');
    //             }
    //             throw error;
    //         }
    //     }
    // }


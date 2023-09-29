import { Injectable, Request, Req, Res, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { PrismaClient, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "src/user/user.service";
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
                }).send({ status: '42user has been created' });
            }
            else {
                const user = await this.userService.getUser({ email });
                user.accessToken = await this.signToken(user.id, user.email);
                res.cookie('token', user.accessToken, {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
                }).send({ status: '42user already exist : cookie updated' });
            }
            res.redirect('http://localhost:4000/auth/test-42-user');
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

    async signup(dto: AuthDto, @Res() res: any) {
        const hash = await argon.hash(dto.password);
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    first_name: dto.first_name,
                    last_name: dto.last_name,
                    hash,
                },
            });
            user.accessToken = await this.signToken(user.id, user.email);
            res.cookie('token', user.accessToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
            }).send({ status: 'user has been created' });
            // res.redirect('http://localhost:4000/auth/test-normal-user');
        }
        catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') { throw new ForbiddenException('Credentials taken'); }
            }
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
        }).send({ status: 'SIGNED' });
        res.redirect('http://localhost:4000/auth/test-normal-user');
    }

    async signToken(userID: number, email: string): Promise<string> {
        const payload = {
            sub: userID,
            email
        };
        const secret = this.config.get('JWT_SECRET');
        const token = await this.jwt.signAsync(payload, {
            expiresIn: '10m',
            secret: secret,
        });
        return token;
    }

}
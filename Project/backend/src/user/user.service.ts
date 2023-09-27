import { EdithUserDto } from "./dto";
import { Injectable, Body, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { Prisma, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';

@Injectable()
export class UserService {
	
	constructor(private prisma: PrismaService) {}
	
	async createUser(data: Prisma.usersCreateInput): Promise<users> {
		try {
		  return await this.prisma.users.create({
			data,
		  });
		} catch (error) {
		  return error;
		}
	  }

	async edithUser(userId: number, dto: EdithUserDto) {
		const user = await this.prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				...dto,
			},
		});
		delete user.hash;
		return user;
	}

	async getUserById(userId: number): Promise<User | null> {
		return this.prisma.user.findUnique({
		  	where: {
				id: userId,
			},
		});
	}

	async getUserByEmail(email: string): Promise<User | null> {
		return this.prisma.user.findUnique({
			where: {
				email: email,
			},
		});
	}
	
	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		const user = this.prisma.user.findUnique({
			where: { id: userId },
		});

		(await user).two_factor_secret = secret;
	}
	
	async turnOnTwoFactorAuthentication(userId: number) {
		const user = this.prisma.user.findUnique({
			where: { id: userId },
		});
		(await user).two_factor_activate = true;
	}
}

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
	
	async createUser(data: Prisma.UserCreateInput): Promise<User> {
		try {
			return await this.prisma.user.create({
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

	async getUser(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
		return await this.prisma.user.findUnique({
			where,
		});
	}

	// async deleteUser(where: Prisma.UserWhereUniqueInput) {
	// 	try {
	// 		return await this.prisma.user.delete({
	// 			where,
	// 		});
	// 	} catch (error) {
	// 	return error;
	// 	}
	// }
}

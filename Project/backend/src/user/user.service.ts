import { EdithUserDto } from "./dto";
import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { Prisma, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { HttpException } from '@nestjs/common';

@Injectable()
export class UserService {

    constructor(private prisma: PrismaService) { }

    async createUser(data: Prisma.UserCreateInput): Promise<User> {
        try {
            return await this.prisma.user.create({
                data,
            });
        } catch (error) {
            return error;
        }
    }

	async getUser(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where,
        });
    }

	async getUserByToken(@Req() req) {
		try {
		const accessToken = req.cookies.token;
		const user = await this.prisma.user.findFirst({
			where: { accessToken: accessToken },
			});
			if (!user) {
				throw new HttpException( {
				status: HttpStatus.BAD_REQUEST,
				error: "Error to get the user by token" },
				HttpStatus.BAD_REQUEST);
			};
			return user;
		} catch (error) {
		  throw new HttpException( {
			  status: HttpStatus.BAD_REQUEST,
			  error: "Error to get the user by token"},
			 HttpStatus.BAD_REQUEST);
			};
	  }

	async deleteUser(where: Prisma.UserWhereUniqueInput) {
		try {
			return await this.prisma.user.delete({
				where,
			});
		} catch (error) {
		return error;
		}
	}

	//////////////// 2FA SETTNGS //////////////////

	// Update our user with the 2FA secret generated in the auth.service
	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { two_factor_secret: secret }
		});
    }

	// To allow our user to Turn-on the 2FA authentication mode
	async turnOnTwoFactorAuthentication(userId: number) {
		const userEnabling2FA = await this.prisma.user.findUnique({
			where: { id: userId },
			});
		const updateUser = await this.prisma.user.update({
			where: { id: userId },
			data: { is_two_factor_activate: true}});
	}

	// To allow our user to Turn-on the 2FA authentication mode
	// async turnOffTwoFactorAuthentication(userId: number) {
	// 	const userEnabling2FA = await this.prisma.user.findUnique({
	// 		where: { id: userId },
	// 		});
	// 	const updateUser = await this.prisma.user.update({
	// 		where: { id: userId },
	// 		data: { is_two_factor_activate: false}});
	// }

}


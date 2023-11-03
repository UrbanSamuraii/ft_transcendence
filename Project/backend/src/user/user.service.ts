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

    // USE IT LIKE : const user = await this.userService.getUser({ email or username });
    async getUser(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where,
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return await this.prisma.user.findUnique({
            where: {
                id: id,
            },
        });
    }

    async getUserByToken(token: string) {
        // console.log("token = ", token);
        try {
            const user = await this.prisma.user.findFirst({
                where: { accessToken: token },
                include: { conversations: true },
            });
            if (!user) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: "Error to get the user by token"
                },
                    HttpStatus.BAD_REQUEST
                );
            }
            return user;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "Error to get the user by token"
            }, HttpStatus.BAD_REQUEST);
        }
    }

    async getUserByUsername(username: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { username: username },
            });
            if (!user) {
                throw new HttpException({
                    status: HttpStatus.BAD_REQUEST,
                    error: "Error: User not found"
                }, HttpStatus.BAD_REQUEST);
            }
            return user;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: "Error: Unable to retrieve user"
            }, HttpStatus.BAD_REQUEST);
        }
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
    // We need here to UPDATE THE TOKEN with a 2FA SIGNED ONE
    async turnOnTwoFactorAuthentication(userId: number, new2FAToken: string) {
        const updateUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                is_two_factor_activate: true,
                accessToken: new2FAToken
            }
        });
        return updateUser;
    }

    // To get a user's conversations
    // const userConversations = await prisma.user.findUnique({
    //     where: { id: userId },
    //   }).conversations();
      
}


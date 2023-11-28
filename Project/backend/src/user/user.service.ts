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
                include: {
                    gamesWon: true
                }
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

    async getUserIdByUsername(username: string): Promise<number | null> {
        const user = await this.prisma.user.findUnique({
            where: { username },
            select: { id: true } // Select only the ID
        });
        return user?.id || null;
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

    //UPDATE GAME RELATED DATABASE

    async incrementGamesWon(userId: number): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    totalGamesWon: {
                        increment: 1 // Increment the gamesWon field by 1
                    }
                }
            });
        } catch (error) {
            // Handle errors, possibly throw a custom error or log it
            console.error("Error incrementing games won:", error);
            throw error;
        }
    }

    // SPECIFIC for Conversations
    // To get the user - and the fact that we find it or not
    async getUserByUsernameOrEmail(inputDataMember: string): Promise<User | null> {
        const usersArray = inputDataMember.split(/[.,;!?'"<>]|\s/);
        const email = usersArray[0];
        let member = null;
        
        const memberByEmail = usersArray[0] !== "" ? await this.getUser({ email }) : null;
        if (memberByEmail) {
            return memberByEmail;
        } else {
            const username = usersArray[0];
            const memberByUsername = usersArray[0] !== "" ? await this.getUser({ username }) : null;
            if (memberByUsername) {
               return memberByUsername;
            }
            else { return null; }
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
}


import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode, BadRequestException } from "@nestjs/common";
import { Prisma, User, Conversation} from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { HttpException } from '@nestjs/common';
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { MembersService } from "src/members/members.service";

@Injectable()
export class ConversationsService {

	constructor(private prismaService: PrismaService,
				private userService: UserService,
				private configService: ConfigService,
				private membersService: MembersService) {}

	async getConversation(id: string) {
	}

}
































// async createConversation(name: string, sub: number) {
// 	const existingConversation = this.prismaService.conversation.findFirst({
// 		where: {
// 			name,
// 		}
// 	});
// 	if (existingConversation) {
// 		throw new BadRequestException({name : "Conversation already exist"})
// 	}
// 	return this.prismaService.conversation.create({
// 		data: {
// 			name,
// 			members: {
// 				connect: {
// 					id: sub,   	// For now we just have our user creating the conv who is in it and we are going to add user 
// 								// 1 by 1. If at the end there is only one user -> we are gonna delete the conversation
// 				}
// 			}
// 		}
// 	})
// }


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

	// To get the Conversation Name at the creation
	async establishConvName(inputDataConvName: string): Promise<string | null> {
		const name = inputDataConvName.split(/[,;'"<>]|\s/);
		const convName = name[0];
		return convName;
	}

	// To get the user - and the fact that we find it or not
	async getMemberByUsernameOrEmail(inputDataMember: string) {
		const usersArray = inputDataMember.split(/[.,;!?'"<>]|\s/);
		const email = usersArray[0];
		let member = null;
		let userFound = true;
		if (usersArray[0] !== "") {userFound = false;}
		const memberByEmail = usersArray[0] !== "" ? await this.userService.getUser({ email }) : null;
		if (memberByEmail) {
			member = memberByEmail;
			userFound = true;
		} else {
			const username = usersArray[0];
			const memberByUsername = usersArray[0] !== "" ? await this.userService.getUser({ username }) : null;
			if (memberByUsername) { 
				member = memberByUsername;
				userFound = true;
			}
		}
		return {member, userFound};
	}

	async createConversation(convName: string, userMember: User, firstInviteMember: User | null) {
		
		const existingConversation = await this.getConversationByName(convName);
		if (existingConversation) { return null; }
		
		const conversationData: Prisma.ConversationCreateInput = { name: convName };
		const createdConversation = await this.prismaService.conversation.create({data: conversationData});
		
		await this.addUserToConversation(userMember.id, createdConversation.id);
		if (firstInviteMember) {await this.addUserToConversation(firstInviteMember.id, createdConversation.id);}
		
		return createdConversation;
	}

	/////////////////// ADD / REMOVE MEMBER ///////////////////
	
	async addUserToConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (!isMember) {
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						members: {
							connect: [{ id: userId }],
						},
					},
				});
				await this.membersService.addConversationInMembership(userId, existingConversation.id);
				return true; // The user has been added
			} else { return false; // The user was already in
			}
		}
		else {return false;}
	}
	
	async removeMemberFromConversation(userId: number, conversationId: number): Promise<boolean> {
		const existingConversation = await this.prismaService.conversation.findUnique({
		  where: { id: conversationId },
		  include: { members: true },
		});
		if (existingConversation) {
			const isMember = existingConversation.members.some((member) => member.id === userId);
			if (isMember) {
				await this.prismaService.conversation.update({
					where: { id: conversationId },
					data: {
						members: {
							disconnect: [{ id: userId }],
						},
					},
				});
				await this.membersService.removeConversationFromMembership(userId, existingConversation.id);
				return true; // The user has been removed
			} else {
				return false; // The user was not a member of this conversation
			}
		} else {
			return false; // We haven t found the conversation
		}
	}

	/////////////////// GETTERS /////////////////// 

	async getConversationByName(convName: string): Promise<Conversation | null> {
		return await this.prismaService.conversation.findUnique({
			where: { name: convName },
			include: { members: true },
		});
	}
	
	async getConversationById(convId: number): Promise<Conversation | null> {
		return await this.prismaService.conversation.findUnique({
			where: { id: convId },
			include: { members: true },
		});
	}

	async getConversationMembers(conversationId: number): Promise<User[]> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		});
		
		if (conversation) {
			return conversation.members;
		} else { // Not sure it is usefull, we will check this into a conversation directly
			return [];
		}
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


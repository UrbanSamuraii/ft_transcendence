import { Injectable } from "@nestjs/common";
import { Conversation, User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { IMembersService } from './members' 
import { UserService } from "src/user/user.service";

@Injectable()
export class MembersService implements IMembersService {
	
	constructor(private prismaService: PrismaService,
				private userService: UserService) {};

	async findMemberInConversation(conversationId: number, userId: string): Promise<User | null> {
		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		  });
		
		  if (!conversation) { return null; }
		
		  const memberFinded = conversation.members.find((member) => member.id === parseInt(userId));
		
		  return memberFinded || null; // Return the found member or null if not found
	}

	async addConversationInMembership(userId: number, conversationId: number) {
		const existingUser = await this.prismaService.user.findUnique({
		  where: { id: userId },
		  include: { conversations: true },
		});
	  
		if (existingUser) {
			const updatedConversations = [
				...existingUser.conversations.map((conv) => ({ id: conv.id })),
				{ id: conversationId }];
	  
		  await this.prismaService.user.update({
			where: { id: userId },
			data: { conversations: { set: updatedConversations } },
		  });
		}
	  }

	async removeConversationFromMembership(userId: number, conversationId: number) {
		const existingUser = await this.prismaService.user.findUnique({
			where: { id: userId },
			include: { conversations: true },
		});

		if (existingUser) {
			const updatedConversations = existingUser.conversations.filter((conv) => conv.id !== conversationId);
		  
			await this.prismaService.user.update({
			  where: { id: userId },
			  data: { conversations: { set: updatedConversations } },
			});
		}
	}
	  
	async getMemberWithConversationsHeIsMemberOf(user: User) {
		const userWithConversations = await this.prismaService.user.findUnique({
			where: { id: user.id },
			include: { conversations: { } }
		});
		return userWithConversations;
	}
}


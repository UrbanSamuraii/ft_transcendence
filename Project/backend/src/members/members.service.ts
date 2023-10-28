import { Injectable } from "@nestjs/common";
import { User } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { IMembersService } from './members' 
import { UserService } from "src/user/user.service";

@Injectable()
export class MembersService implements IMembersService {
	
	constructor(private prisma: PrismaService,
				private userService: UserService) {};

	async findMemberInConversation(conversationId: number, userId: string): Promise<User | null> {
		const conversation = await this.prisma.conversation.findUnique({
			where: { id: conversationId },
			include: { members: true },
		  });
		
		  if (!conversation) { return null; }
		
		  const memberFinded = conversation.members.find((member) => member.id === parseInt(userId));
		
		  return memberFinded || null; // Return the found member or null if not found
	}

	async addMember(conversationId: number, userId: string): Promise<User | null> {
		const conversation = await this.prisma.conversation.findUnique({
			where: {
			  id: conversationId },
			include: { members: true },
		  });
		  if (!conversation) { return null; }
		
		  const memberToAdd = await this.userService.getUserById(parseInt(userId));
		  if (!memberToAdd) { return null; }

		  await this.prisma.conversation.update({
			where: { id: conversation.id },
			data: {
			  members: {
				connect: { id: memberToAdd.id },
			  },
			},
		  });
		  return memberToAdd;
	}
	
}


import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode, BadRequestException } from "@nestjs/common";
import { Prisma, User, Conversation, $Enums} from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { IMembersService } from './members' 
import { UserService } from "src/user/user.service";
import { ConversationsService } from "src/conversations/conversations.service";

@Injectable()
export class MembersService implements IMembersService {
	
	constructor(private prisma: PrismaService,
				private userService: UserService) {};

	async findMemberInConversation(conversationId: number, userId: string): Promise<User | null> {
		const conversation = await this.prisma.conversation.findUnique({
			where: {
			  id: conversationId,
			},
			include: {
			  members: true,
			},
		  });
		
		  if (!conversation) { return null; }
		
		  const memberFinded = conversation.members.find((member) => member.id === parseInt(userId));
		
		  return memberFinded || null; // Return the found member or null if not found
	}

	addMember(): Promise<User | null> {
		throw new Error('Method not implemented yet');
	}
	
}


import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode, BadRequestException } from "@nestjs/common";
import { Prisma, User, Conversation, Message} from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { HttpException } from '@nestjs/common';
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";
import { MembersService } from "src/members/members.service";
import { IMessagesService } from "./messages";
import { ConversationsService } from "src/conversations/conversations.service";

@Injectable()
export class MessagesService implements IMessagesService {

	constructor(private prismaService: PrismaService,
				private membersService: MembersService,
				private conversationsService: ConversationsService) {};

	async createMessage(author: User, content: string, conversation: Conversation): Promise<Message> {
		
		// We will have to implement a lot of this kind of verif to check if the user is banned, muted etc etc ....
		const isMember = await this.membersService.findMemberInConversation(conversation.id, author.id);

		if (!isMember) {throw new HttpException("Conversation member not identified", HttpStatus.FORBIDDEN)}
		else {
			const newMessageData: Prisma.MessageCreateInput = { message: content,
																author: { connect: { id: author.id } },
																conversation: { connect: { id: conversation.id } },}
			const createdMessage = await this.prismaService.message.create({
				data: newMessageData,
			});
			// To update the conversation to include the new message 
			// Be carefull, the new message is added at the end of the array
			await this.conversationsService.addMessageToConversation(conversation.id, createdMessage.id);
			return createdMessage;
		}
	}

}
import { Controller, Post, Body, Get, Res, UseGuards, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { MessagesService } from './messages.service';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { ConversationsService } from 'src/conversations/conversations.service';
import { PrismaService } from 'src/prisma/prisma.service';

@UseGuards(Jwt2faAuthGuard)
@Controller('messages')
export class MessagesController {

	constructor(private prismaService: PrismaService,
		private userService: UserService,
		private messagesService: MessagesService) { }

	@Post()
	async createMessage(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		
		const user = await this.userService.getUserByToken(req.cookies.token);
		const convId = req.body.conversationId;
		const content = req.body.content;

		const conversation = await this.prismaService.conversation.findUnique({
			where: { id: convId },
			include: { members: true, messages: true },
		});
		if (!conversation) { throw new HttpException("Conversation not found", HttpStatus.BAD_REQUEST)};

		const newMessage = await this.messagesService.createMessage(user, content, conversation);
		if (newMessage) {res.status(200).json({ message: "Message created", messageCreated: newMessage });}
	}
}

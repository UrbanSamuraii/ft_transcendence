import { Controller, Post, Body, Get, Res, UseGuards, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { ConversationsService } from './conversations.service';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { MembersService } from 'src/members/members.service';

@UseGuards(Jwt2faAuthGuard)
@Controller('conversations')
export class ConversationsController {

	constructor(private convService: ConversationsService,
				private userService: UserService,
				private memberService: MembersService) { }
	
	@Post('create')
	async CreateConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		// Get the first invited member if there is one
		let member = null;
		let userFound = true;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.users));
		
		// Get the name of the conversation
		const convName = await this.convService.establishConvName(req.body.name);
		// Creating the conversation
		const createdConversation = await this.convService.createConversation(convName, user, member);
		
		if (!createdConversation) {
			res.status(403).json({ message: "A Conversation with the same name already exist" });}
		else {
			if (userFound) {
				res.status(201).json({ message: "Conversation created", conversationId: createdConversation.id });
			} else {
				res.status(202).json({ message: "Conversation created, but the user was not found.", conversationId: createdConversation.id  });
			}
		}
	}

	@Get()
	async GetConversations(@Req() req) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		const userWithConversations = await this.memberService.getMemberWithConversationsHeIsMemberOf(user);
		return (userWithConversations.conversations);
	}

	@Get(':id')
	async GetConversationById(@Param('id') id: string) {
		const idConv = parseInt(id);
		const conversation = await this.convService.getConversationWithAllMessagesById(idConv);

		if (conversation) { return conversation; } 
		else { throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND); }
	}


	// By using @Param, NestJS automatically extracts the value of id from the URL's path parameters and assigns it to the conversationId variable
	@Post(':id/add_member')
	async AddMemberToConversation(@Param('id') conversationId: string, @Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let added = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.userToAdd));
		if (!userFound) {
			res.status(403).json({ message: "User not found." });}
		else {
			const userId = member.id;
			added = await this.convService.addUserToConversation(userId, parseInt(conversationId))
			if (added) {
				res.status(201).json({ message: "User added to the conversation." });}
			else {
				res.status(403).json({ message: "User is already in the conversation." });}
		}
	}

	@Post(':id/remove_member')
	async RemoveMemberFromConversation(@Param('id') conversationId: string, @Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let removed = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.memberToRemove));
		if (!userFound) {
			res.status(403).json({ message: "User not found." });}
		else {
			const memberId = member.id;
			removed = await this.convService.removeMemberFromConversation(memberId, parseInt(conversationId))
			if (removed) {
				res.status(201).json({ message: "The member has been removed from the conversation." });}
			else {
				res.status(403).json({ message: "Can't remove the member you are looking for from this conversation." });}
		}
	}
}



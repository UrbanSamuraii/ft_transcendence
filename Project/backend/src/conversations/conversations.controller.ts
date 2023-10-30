import { Controller, Post, Body, Get, Res, UseGuards, Req, Param } from '@nestjs/common';
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
		console.log({"USER CREATING THE CONV": user});
		// Get the first invited member if there is one
		let invitedMember = null;
		let userFound = true;
		({ invitedMember, userFound } = await this.convService.getNewMemberInvited(req.body.users));
		console.log({"INVITED MEMBER": invitedMember});
		
		// Get the name of the conversation
		const convName = await this.convService.establishConvName(req.body.name);
		
		// Creating the conversation
		const createdConversation = await this.convService.createConversation(convName, user, invitedMember);
		
		if (!createdConversation) {
			res.status(403).json({ message: "A Conversation with the same name already exist" });}
		else {
			if (userFound) {
				res.status(201).json({ message: "Conversation created" });
			} else {
				res.status(202).json({ message: "Conversation created, but the user was not found." });
			}
		}
	}

	@Post('add_member')
	async AddMemberToConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let invitedMember = null;
		let userFound = true;
		let added = false;
		({ invitedMember, userFound } = await this.convService.getNewMemberInvited(req.body.userToAdd));
		if (!userFound) {
			res.status(403).json({ message: "User not found." });}
		else {
			const userId = invitedMember.id;
			added = await this.convService.addUserToConversation(userId, req.body.conversationId)
			if (!added) {
				res.status(201).json({ message: "Conversation created." });}
			else {
				res.status(403).json({ message: "User is already in the conversation." });}
		}
	}

	@Post('remove_member')
	async RemoveMemberFromConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let removed = false;
		removed = await this.convService.removeMemberFromConversation(req.body.memberToRemoveId, req.body.conversationId)
		if (removed) {
			res.status(201).json({ message: "The member has been removed from the conversation." });}
		else {
			res.status(403).json({ message: "Can't remove the member you are looking for from this conversation." });}
	}

	@Get()
	async GetConversations(@Req() req) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		console.log({"My user": user.conversations});
		const userWithConversations = await this.memberService.getMemberWithConversationsHeIsMemberOf(user);
		console.log({"My user's conversations": userWithConversations.conversations});
		return (userWithConversations.conversations);
	}

	@Get(':id')
	async GetConversationById(@Param('id') id: string) {
		const idConv = parseInt(id);
		return (this.convService.getConversationById(idConv));
	}
}



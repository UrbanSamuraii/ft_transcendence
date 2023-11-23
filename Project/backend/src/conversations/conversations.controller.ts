import { Controller, Post, Body, Get, Res, UseGuards, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AdminGuard, Jwt2faAuthGuard, OwnerGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { ConversationsService } from './conversations.service';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { MembersService } from 'src/members/members.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagesService } from 'src/messages/messages.service';
import { GetUser } from 'src/auth/decorator';


@UseGuards(Jwt2faAuthGuard)
@Controller('conversations')
export class ConversationsController {

	constructor(private convService: ConversationsService,
				private userService: UserService,
				private memberService: MembersService,
				private messagesService: MessagesService,
				private eventEmitter: EventEmitter2) { }
	
	@Post('create')
	async CreateConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		
		// Get the first invited member if there is one
		let member = null;
		let userFound = true;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.users));
		
		const convName = await this.convService.establishConvName(req.body.name);
		const createdConversation = await this.convService.createConversation(convName, user, member);
		
		if (!createdConversation) {
			res.status(403).json({ message: "A Conversation with the same name already exist" });}
		else {
			this.eventEmitter.emit('join.room', user, createdConversation.id);
			if (userFound) {
				this.eventEmitter.emit('message.create', '');
				this.eventEmitter.emit('join.room', member, createdConversation.id);
				res.status(201).json({ message: "Conversation created", conversationId: createdConversation.id });
			} else {
				this.eventEmitter.emit('message.create', '');
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

	//////////////// HANDLE RULES AND MEMBERS OF THE CONVERSATION ////////////////////

	@Post(':id/add_member')
	@UseGuards(AdminGuard)
	async AddMemberToConversation(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
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
	@UseGuards(AdminGuard)
	async RemoveMemberFromConversation(
		@Param('id') conversationId: string, 
		@GetUser() user: User,
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
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

	@Post(':id/get_member_mute')
	@UseGuards(AdminGuard)
	async muteMemberOfConversation(
		@Param('id') conversationId: string,
		@GetUser() user: User,
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let muted = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.userToMute));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." });}
		else {
			const userId = member.id;
			muted = await this.convService.muteMemberFromConversation(userId, parseInt(conversationId))
			if (muted) {
				res.status(201).json({ message: "User muted from the conversation." });}
			else {
				res.status(403).json({ message: "User is already in mute." });}
		}
	}

	@Post(':id/get_member_unmute')
	@UseGuards(AdminGuard)
	async unmuteMemberOfConversation(
		@Param('id') conversationId: string, 
		@GetUser() user: User,
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let muted = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.userToUnmute));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." });}
		else {
			const userId = member.id;
			muted = await this.convService.removeMemberFromMutedList(userId, parseInt(conversationId))
			if (muted) {
				res.status(201).json({ message: "User unmuted from the conversation." });}
			else {
				res.status(403).json({ message: "User is already unmuted." });}
		}
	}

	@Post(':id/update_member_to_admin')
	@UseGuards(AdminGuard)
	async UpdateMemberToAdmin(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let upgradedUser = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.userToUpgrade));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." });}
		else {
			const userId = member.id;
			upgradedUser = await this.convService.upgrateUserToAdmin(userId, parseInt(conversationId))
			if (upgradedUser) {
				res.status(201).json({ message: "User is now an admin of the conversation." });}
			else {
				res.status(403).json({ message: "User is already an admin of the conversation." });}
		}
	}

	@Post(':id/downgrade_admin_to_member')
	@UseGuards(AdminGuard)
	async DowngradeAdminToMember(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let downgradedUser = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.adminToDowngrade));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." });}
		else {
			const userId = member.id;
			downgradedUser = await this.convService.downgradeAdminStatus(userId, parseInt(conversationId))
			if (downgradedUser) {
				res.status(201).json({ message: "User is not an admin of the conversation anymore." });}
			else {
				res.status(403).json({ message: "User wasn't an admin of the conversation." });}
		}
	}

	@Post(':id/ban_user')
	@UseGuards(AdminGuard)
	async BanUserFromConversation(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const target = await this.userService.getUser(req.body.userToBan);
		if (!target) {
			res.status(403).json({ message: "User not found." });}
		else {
			const userId = target.id;
			const bannedUser = await this.convService.banUserFromConversation(userId, parseInt(conversationId))
			if (bannedUser) {
				res.status(201).json({ message: "User is now banned from the conversation." });}
			else {
				res.status(403).json({ message: "User is already banned from the conversation." });}
		}
	}

	@Post(':id/allow_user')
	@UseGuards(AdminGuard)
	async AllowUserOnConversation(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const target = await this.userService.getUser(req.body.userToAllow);
		if (!target) {
			res.status(403).json({ message: "User not found." });}
		else {
			const userId = target.id;
			const allowedUser = await this.convService.removeUserFromBannedList(userId, parseInt(conversationId))
			if (allowedUser) {
				res.status(201).json({ message: "User is now allowed in this conversation." });}
			else {
				res.status(403).json({ message: "User wasn't banned from the conversation." });}
		}
	}

	@Post(':id/set_password')
	@UseGuards(OwnerGuard)
	async SetConversationPassword(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		
		const oldPassword = await this.convService.getPassword(parseInt(conversationId));
		if (oldPassword) {
			if (oldPassword !== req.body.oldPassword) {
				res.status(403).json({ message: "Actual Password doesn't match without input" });
				return ;
			} 
		}

		const newPassword = await this.convService.setPassword(req.body.newPassword, parseInt(conversationId))
		if (newPassword) {
			res.status(201).json({ message: "New password well implemented." });}
		else {
			res.status(201).json({ message: "The conversation is not protected." });}
	}


}



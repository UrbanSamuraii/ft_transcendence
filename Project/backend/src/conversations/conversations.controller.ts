import { Controller, Post, Body, Get, Res, UseGuards, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AdminGuard, Jwt2faAuthGuard, OwnerGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { ConversationsService } from './conversations.service';
import { User, privacy_t } from '@prisma/client';
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
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.users));
		
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

	@Post('join')
	async JoinConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		const conversation = await this.convService.getConversationByName(req.body.conversationName);

		if (!conversation) {
			res.status(403).json({ message: "There is no conversation of this name, please verify." }); return;}
		
		if (!this.convService.isUserIdBannedFromConversation(user.id, conversation.id)) {
			res.status(403).json({ message: "Your profil is banned from this conversation." }); return;}
		if (conversation.privacy === privacy_t.PRIVATE) {
			res.status(403).json({ message: "The conversation is private, you can't join it - please wait to be invite by an administrator of it." }); return;}
		if (conversation.protected && conversation.password != null) {
			res.status(202).json({ message: "The conversation is protected by a password - you are going to be redirected to guard page.", conversationId: conversation.id }); return;}
		
		const added = await this.convService.addUserToConversation(user.id, conversation.id);
		if (added) {
			res.status(201).json({ message: "You have now joined the conversation." }); return;}
		else {
			res.status(403).json({ message: "You were already in the conversation." }); return;}
	}

	@Post('validate_password')
	async ValidatePassword(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		// We will have to insert the convID in the req somewhere.
		const conversation = await this.convService.getConversationByName(req.body.conversationName);
		const passwordToValidate = conversation.password;

		if (req.body.password === passwordToValidate) {
			const added = await this.convService.addUserToConversation(user.id, conversation.id);
			if (added) {
				res.status(201).json({ message: "You have now joined the conversation." }); return;}
			else {
				res.status(403).json({ message: "You were already in the coonversation." }); return;}
			}
		else {
			res.status(403).json({ message: "Wrong password." }); return;}
	}

	//////////////// HANDLE RULES AND MEMBERS OF SPECIFIC CONVERSATION ////////////////////


	// Admin can add users to conversation - no matter if it is a private or public one
	// The user who has been add doesn t need to enter the password if the conversation is protected
	@Post(':id/add_member')
	@UseGuards(AdminGuard)
	async AddMemberToConversation(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let added = false;
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.userToAdd));
		if (!userFound) {
			res.status(400).json({ message: "User not found." }); return;}
		else {
			const userId = member.id;
			const isAlreadyMember = await this.convService.isMemberOfTheConversation(userId, parseInt(conversationId));
			if (isAlreadyMember) {
				res.status(400).json({ message: "User is already in the conversation." }); return;}
			else {
				added = await this.convService.addUserToConversation(userId, parseInt(conversationId))
				if (added) {
					res.status(201).json({ message: "User added to the conversation." }); return;}
				else {
					res.status(400).json({ message: "Can't add the user to the conversation." }); return;}
			}
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
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.memberToRemove));
		if (!userFound) {
			res.status(403).json({ message: "User not found." }); return;}
		else {
			const memberId = member.id;
			removed = await this.convService.removeMemberFromConversation(memberId, parseInt(conversationId))
			if (removed) {
				res.status(201).json({ message: "The member has been removed from the conversation." }); return;}
			else {
				res.status(403).json({ message: "Can't remove the member you are looking for from this conversation." }); return;}
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
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.userToMute));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." }); return;}
		else {
			const userId = member.id;
			muted = await this.convService.muteMemberFromConversation(userId, parseInt(conversationId))
			if (muted) {
				res.status(201).json({ message: "User muted from the conversation." }); return;}
			else {
				res.status(403).json({ message: "User is already in mute." }); return;}
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
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.userToUnmute));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." }); return;}
		else {
			const userId = member.id;
			muted = await this.convService.removeMemberFromMutedList(userId, parseInt(conversationId))
			if (muted) {
				res.status(201).json({ message: "User unmuted from the conversation." }); return;}
			else {
				res.status(403).json({ message: "User is already unmuted." }); return;}
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
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.userToUpgrade));
		if (!userFound) {
			res.status(403).json({ message: "User not found in the conversation." });}
		else {
			const userId = member.id;
			upgradedUser = await this.convService.upgrateUserToAdmin(userId, parseInt(conversationId))
			if (upgradedUser) {
				res.status(201).json({ message: "User is now an admin of the conversation." });}
			else {
				res.status(403).json({ message: "Can't update this user to admin of the conversation (is already an administrator ?)." });}
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
		({ member, userFound } = await this.userService.getUserByUsernameOrEmail(req.body.adminToDowngrade));
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
		let member = null;
		let userFound = true;
		({member, userFound} = await this.userService.getUserByUsernameOrEmail(req.body.userToBan));
		if (!userFound) {
			res.status(403).json({ message: "User not found." });}
		else {
			const userId = member.id;
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
			let member = null;
			let userFound = true;
			({member, userFound} = await this.userService.getUserByUsernameOrEmail(req.body.userToAllow));
			if (!userFound) {
				res.status(403).json({ message: "User not found." });}
			else {
				const userId = member.id;
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
				return ;}}

		const newPassword = await this.convService.setPassword(req.body.newPassword, parseInt(conversationId))
		if (newPassword) {
			res.status(201).json({ message: "New password well implemented." }); return;}
		else {
			res.status(201).json({ message: "The conversation is not protected." }); return;}
	}

	@Post(':id/set_private')
	@UseGuards(OwnerGuard)
	async SetConversationPrivate(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		await this.convService.setConversationPrivate(parseInt(conversationId));
		res.status(201).json({ message: "Conversation is now Private." });}

	@Post(':id/set_public')
	@UseGuards(OwnerGuard)
	async SetConversationPublic(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		await this.convService.setConversationPublic(parseInt(conversationId));
		res.status(201).json({ message: "Conversation is now Public." });}

}



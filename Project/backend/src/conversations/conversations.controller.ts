import { Controller, Post, Body, Get, Res, UseGuards, Req, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AdminGuard, Jwt2faAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { ConversationsService } from './conversations.service';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';
import { MembersService } from 'src/members/members.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MessagesService } from 'src/messages/messages.service';
import { GetUser } from 'src/auth/decorator';
import { AdminStrategy } from 'src/auth/strategy';


@UseGuards(Jwt2faAuthGuard)
@Controller('conversations')
export class ConversationsController {

	constructor(private convService: ConversationsService,
				private userService: UserService,
				private memberService: MembersService,
				private messagesService: MessagesService,
				private eventEmitter: EventEmitter2,
				private adminStrategy: AdminStrategy) { }
	
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
			await this.convService.upgrateUserToAdmin(user.id, createdConversation.id);
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

	// By using @Param, NestJS automatically extracts the value of id from the URL's path parameters and assigns it to the conversationId variable
	@Post(':id/add_member')
	@UseGuards(AdminGuard)
	async AddMemberToConversation(
		@Param('id') conversationId: string,
		@GetUser() user: User, 
		@Req() req, 
		@Res({ passthrough: true }) res: ExpressResponse) 
		{

	// 	console.log({"USER": user});
	// 	// console.log({"Request": req});
	// 	const authHeaderIndex = req.rawHeaders.indexOf('Authorization');
	// 	let bearerToken;
	// // Check if 'Authorization' header is present
	// 	if (authHeaderIndex !== -1) {
  	// 	const authorizationValue = req.rawHeaders[authHeaderIndex + 1];
  	// 	if (authorizationValue && authorizationValue.startsWith('Bearer')) {
	// 	    const bearerToken = authorizationValue.slice(7);
    // 		// console.log('Bearer Token:', bearerToken);
	// 		}
	// 	}
	// 	const AuthUser = await this.userService.getUserByToken(bearerToken);
	// 	console.log({"AUTH USER ID": AuthUser.id});
	// 	const result = await this.adminStrategy.validate(String(AuthUser.id), conversationId);
  	// 	console.log('Validation Result:', result);
		
		
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

	@Post(':id/get_member_mute')
	async muteMemberOfConversation(@Param('id') conversationId: string, @Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let muted = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.userToMute));
		if (!userFound) {
			res.status(403).json({ message: "User not found." });}
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
	async unmuteMemberOfConversation(@Param('id') conversationId: string, @Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		let member = null;
		let userFound = true;
		let muted = false;
		({ member, userFound } = await this.convService.getMemberByUsernameOrEmail(req.body.userToUnmute));
		if (!userFound) {
			res.status(403).json({ message: "User not found." });}
		else {
			const userId = member.id;
			muted = await this.convService.removeMemberFromMutedList(userId, parseInt(conversationId))
			if (muted) {
				res.status(201).json({ message: "User unmuted from the conversation." });}
			else {
				res.status(403).json({ message: "User is already unmuted." });}
		}
	}
}



import { Controller, Post, Body, Res, UseGuards, Req } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { ConversationsService } from './conversations.service';
import { User } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@UseGuards(Jwt2faAuthGuard)
@Controller('conversations')
export class ConversationsController {

	constructor(private convService: ConversationsService,
				private userService: UserService) { }
	
	@Post('create')
	async CreateConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		// Get the first invited member
		const usersInput = req.body.users;
		const usersArray = usersInput.split(/[.,;!?'"<>]|\s/);
		const email = usersArray[0];
		let firstUser = null;
		let userFound = true;
		if (usersArray[0] !== "") {userFound = false;}

		const firstUserByEmail = usersArray[0] !== "" ? await this.userService.getUser({ email }) : null;
		if (firstUserByEmail) {
			firstUser = firstUserByEmail;
			userFound = true;
		} else {
			const username = usersArray[0];
			const firstUserByUsername = usersArray[0] !== "" ? await this.userService.getUser({ username }) : null;
			if (firstUserByUsername) { 
				firstUser = firstUserByUsername;
				userFound = true;
			}
		}

		// Get the name of the conversation
		const nameInput = req.body.name;
		const name = nameInput.split(/[,;'"<>]|\s/);
		const convName = name[0];
		
		// Creating the conversation
		const createdConversation = await this.convService.createConversation(convName, user, firstUser);
		
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
}		


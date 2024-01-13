import { Controller, Get, UseGuards, Req, Res, Post, HttpException, HttpStatus } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { UserService } from 'src/user/user.service';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@UseGuards(Jwt2faAuthGuard)
@Controller('users')
export class UserController {
    
    constructor(private userService: UserService) { }

    @Get('me')
    getMe(@GetUser() user: User,
        @GetUser('email') email: string) {
        console.log(email);
        return user;
    }

    @Post('add_friend')
	async AddNewFriend(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		const target = await this.userService.getUserByUsernameOrEmail(req.body.userName);
		if (!target) {
			res.status(400).json({ message: "User not found." }); return;}
		else {
            const friend_added = await this.userService.addNewFriend(user.id, target.id);
            if (friend_added) {
                res.status(201).json({ message: "New friendship established." }); return;} 
            else {
                res.status(400).json({ message: "This user is already a friend." }); return;} 
        }
    }

    @Post('remove_friend')
	async RemoveFriend(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		const target = await this.userService.getUserByUsernameOrEmail(req.body.userName);
		if (!target) {
			res.status(400).json({ message: "User not found." }); return;}
		else {
            const friend_removed = await this.userService.removeFriend(user.id, target.id);
            if (friend_removed) {
                res.status(201).json({ message: "This user have been removed from your friends." }); return;} 
            else {
                res.status(400).json({ message: "This user was not a friend." }); return;} 
        }
    }

    @Post('get_friends')
    async GetFriendsList(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req.cookies.token);
		const friendsList = await this.userService.getUserFriendsList(user.id);
        if (friendsList) { return friendsList; } 
		else { throw new HttpException('Conversation not found', HttpStatus.NOT_FOUND); }
    }

}

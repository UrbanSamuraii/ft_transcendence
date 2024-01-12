import { Controller, Get, UseGuards, Req, Res, Post } from '@nestjs/common';
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

    // @Post('add_friend')
	// async AddNewFriend(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
	// 	const user = await this.userService.getUserByToken(req.cookies.token);
	// 	const target = await this.userService.getUserByUsernameOrEmail(req.body.userName);
	// 	if (!target) {
	// 		res.status(400).json({ message: "User not found." }); return;}
	// 	else {
    //         await this.userService.addNewFriend(user.id, target.id)
    //         res.status(201).json({ message: "New friendship established." }); return;}
    //     }
}

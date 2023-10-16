import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@UseGuards(Jwt2faAuthGuard)
@Controller('users')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User,
	@GetUser('email') email: string) {
		console.log(email);
		return user;
	}
}

import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
	@Get('me')
	getMe(@GetUser() user: User,
	@GetUser('email') email: string) {
		console.log(email);
		return user;
	}	
}

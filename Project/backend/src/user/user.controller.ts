// import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
// import { Prisma } from '@prisma/client';
// import { Body, Post, HttpException, HttpStatus } from '@nestjs/common';
// import { AuthDto } from '../auth/dto/auth.dto';
// import { UserService } from './user.service';

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

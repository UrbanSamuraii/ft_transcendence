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


// We are here using Guards to protect our endpoint
// Here we are using an already set up Guards in nest/passport (identified with the key word implemented in the PassportStrategy)

// The UseGuards is implemented at the root -> everything must be checked before
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { Body, Post, HttpException, HttpStatus } from '@nestjs/common';
import { AuthDto } from '../auth/dto/auth.dto';
import { UserService } from './user.service';

// @UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {

    constructor(private readonly usersService: UserService) { }

    @Post('add')
    async addUser(@Body() authDto: AuthDto) {
        try {
            const userData: Prisma.UserCreateInput = {
                first_name: authDto.first_name,
                last_name: authDto.last_name,
                email: authDto.email,
                // password: authDto.password,  // This will be hashed in the service
                username: authDto.username,
            };
            const user = await this.usersService.createUser(userData);
            return { message: 'User added successfully', user };
        } catch (error) {
            throw new HttpException(error.message || 'Failed to add user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('me')
    getMe(@GetUser() user: User,
        @GetUser('email') email: string) {
        console.log(email);
        return user;
    }
}

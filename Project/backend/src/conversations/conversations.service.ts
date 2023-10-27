import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode } from "@nestjs/common";
import { Prisma, User, Conversation } from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { HttpException } from '@nestjs/common';
import { UserService } from "src/user/user.service";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class ConversationsService {

	constructor(private prismaService: PrismaService,
				private userService: UserService,
				private configService: ConfigService) {}

	async getConversation(id: string) {
		return this.prismaService.
	};
}


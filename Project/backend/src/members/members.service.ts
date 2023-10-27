import { Injectable, Req, Res, Body, ForbiddenException, HttpStatus, HttpCode, BadRequestException } from "@nestjs/common";
import { Prisma, User, Conversation, $Enums} from '@prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { IMembersService } from './members' 
import { UserService } from "src/user/user.service";
import { ConversationsService } from "src/conversations/conversations.service";

@Injectable()
export class MembersService implements IMembersService {
	
	constructor(private prisma: PrismaService,
				private userService: UserService) {};

	async findMember(id: string): Promise<User | null> {
		const user_id = parseInt(id);
		const memberToFind = await this.userService.getUserById(user_id);
		return memberToFind;
	}

	addMember(): Promise<User | null> {
		throw new Error('Method not implemented yet');
	}
	
}


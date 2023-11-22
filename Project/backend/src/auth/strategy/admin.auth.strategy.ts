import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";
import { ConversationsService } from 'src/conversations/conversations.service';
import { Prisma, User } from '@prisma/client';


@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') 
{
  constructor(private prisma: PrismaService, private conversationsService: ConversationsService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string): Promise<Partial<User>> {
    const adminUser = await this.conversationsService.validateAdminUser(email);
    if (!adminUser) {
      throw new UnauthorizedException();
    }
    return adminUser;
  }
}
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GetConversationId } from '../decorator/get-conversation.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ConversationAdminGuard implements CanActivate {
  constructor(private prismaService: PrismaService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const user = context.switchToHttp().getRequest().user; 
    const conversationId = GetConversationId(null, context);

    // implement your logic to check if the user is an administrator for the given conversation
    // you can use user data, conversationId, and any injected services or dependencies here

    // For example, you might check if the user has the 'admin' role for the conversation
    const isAdmin = /* your logic here */;

    return isAdmin;
  }
}
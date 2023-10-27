import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';

@Global()
@Module({
    providers: [ConversationsService, PrismaService],
    controllers: [ConversationsController],
    exports: [ConversationsService]
})
export class UserModule { }
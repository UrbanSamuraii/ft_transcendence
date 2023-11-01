import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game/game.gateway';
import { SquareGameService } from './game/game.square.service';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';

@Module({
    imports: [
        AuthModule,
        ConversationsModule,
        MessagesModule,
        UserModule, 
        PrismaModule, 
        ConfigModule.forRoot({ isGlobal: true }), 
        ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', '..', '..', 'dist', 'client') }),
    ],
    providers: [GameGateway, SquareGameService],
})
export class AppModule { }

// Similar to Prisma - making our ConfigModule global


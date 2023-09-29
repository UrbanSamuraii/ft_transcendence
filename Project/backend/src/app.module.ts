import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChannelsModule } from './channels/channels.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaClient } from '@prisma/client';
import { ConfigModule } from '@nestjs/config';
import { GameGateway } from './game.gateway';


@Module({
    imports: [AuthModule, UserModule, ChannelsModule, PrismaModule, ConfigModule.forRoot({ isGlobal: true })],
    providers: [GameGateway],
})
export class AppModule { }

// Similar to Prisma - making our ConfigModule global

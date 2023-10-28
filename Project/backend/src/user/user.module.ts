import { Global, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

@Global()
@Module({
    providers: [UserService, PrismaService],
    controllers: [UserController],
    exports: [UserService]
})
export class UserModule { }


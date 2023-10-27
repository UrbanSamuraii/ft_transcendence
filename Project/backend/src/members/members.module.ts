import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembersService } from './members.service';

@Global()
@Module({
    providers: [MembersService],
    exports: [MembersService]
})

export class MembersModule { }
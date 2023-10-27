import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Jwt2faAuthGuard } from 'src/auth/guard';

@UseGuards(Jwt2faAuthGuard)
@Controller('conversations')
export class ConversationsController {}
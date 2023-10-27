import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { FortyTwoAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { ConversationsService } from './conversations.service';
import { CreateConvDto } from './dto';

@UseGuards(FortyTwoAuthGuard)
@Controller('conversations')
export class ConversationsController {

	constructor(private convService: ConversationsService) { }
	
	// async CreateConversation(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
	@Post('create')
	async CreateConversation(@Body() CreateConvPayload: CreateConvDto){
        console.log({"CreateConvPayload ": CreateConvPayload});
		// return (await this.convService.createConversation());
    }

}
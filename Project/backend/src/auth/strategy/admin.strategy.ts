import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { MembersService } from 'src/members/members.service';
import { ConversationsService } from 'src/conversations/conversations.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy) 
{
  constructor(private memberService: MembersService, private conversationsService: ConversationsService) {
    super({
      usernameField: 'userId',
	  passwordField: 'conversationId',
    });
  }

  async validateAdmin(userId: string, conversationId: string): Promise<boolean> {
    const parsedUserId = Number(userId);
    const parsedConversationId= Number(conversationId);
	console.log({"User id": parsedUserId});
	console.log({"Conversation id": parsedConversationId});

	const adminUser = await this.memberService.isAdmin(parsedConversationId, parsedUserId);
    if (!adminUser) {
		console.log("USER IS NOT AN ADMIN");
      	throw new UnauthorizedException();
    }
	console.log("USER IS AN ADMIN");
    return adminUser;
  }
}
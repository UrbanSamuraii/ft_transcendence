import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { AdminStrategy } from '../strategy';
import { UserService } from 'src/user/user.service';
import { Strategy } from 'passport-jwt';

@Injectable()
export class AdminGuard extends AuthGuard('admin')
{
  constructor(private readonly adminStrategy: AdminStrategy,
			private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
	const authHeaderIndex = request.rawHeaders.indexOf('Authorization');
	// Check if 'Authorization' header is present
	if (authHeaderIndex !== -1) {
  		const authorizationValue = request.rawHeaders[authHeaderIndex + 1];
  		if (authorizationValue && authorizationValue.startsWith('Bearer')) {
		    const bearerToken = authorizationValue.slice(7);
			const user = await this.userService.getUserByToken(bearerToken);
			const userId = user.id;
			console.log({"USER ID GUARD ": userId});
			const conversationId = request.params.id;
			request.conversationId = conversationId;
			console.log({"CONV ID GUARD ": conversationId});
			const test = await super.canActivate(context);
			console.log({"Test": test});
			return (await super.canActivate(context)) as boolean;
		}
	}
	const test = await super.canActivate(context);
	console.log({"Test": test});
	return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
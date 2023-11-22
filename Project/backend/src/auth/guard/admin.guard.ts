import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { AdminStrategy } from '../strategy';
import { UserService } from 'src/user/user.service';
import { Strategy } from 'passport-jwt';

@Injectable()
export class AdminAuthGuard extends AuthGuard('admin')
{
  constructor(private readonly adminStrategy: AdminStrategy,
			private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
	const authHeaderIndex = request.rawHeaders.indexOf('Authorization');
	let bearerToken;
	// Check if 'Authorization' header is present
	if (authHeaderIndex !== -1) {
  		const authorizationValue = request.rawHeaders[authHeaderIndex + 1];
  		if (authorizationValue && authorizationValue.startsWith('Bearer')) {
		    const bearerToken = authorizationValue.slice(7);
    		// console.log('Bearer Token:', bearerToken);
			}
	}
	const user = await this.userService.getUserByToken(bearerToken);
	console.log('User id:', user.id);
    const userId = user.id;
    const conversationId = request.params.id;

    request.conversationId = conversationId;
	console.log({"USER ID GUARD": userId});
	console.log({"CONV ID GUARD": conversationId});

	return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
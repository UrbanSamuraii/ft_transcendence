import { AuthGuard } from "@nestjs/passport";
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
	constructor() {
		super();
	}
}


// @Injectable()
// export class Jwt2faAuthGuard extends AuthGuard('jwt-2fa') {
// 	constructor() {
// 		super();
// 	}
// }
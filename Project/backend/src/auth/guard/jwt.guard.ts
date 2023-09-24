import { AuthGuard } from "@nestjs/passport";
import { Injectable } from '@nestjs/common';

// We are extending AuthGuard with jwt strategy 
export class JwtGuard extends AuthGuard('jwt') {
	constructor() {
		super();
	}
}

@Injectable()
export class Jwt2faAuthGuard extends AuthGuard('jwt-2fa') {
	constructor() {
		super();
	}
}
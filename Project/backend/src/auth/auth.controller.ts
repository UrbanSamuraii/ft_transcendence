import { Controller, Post, Get, Res, Response,
	Body, HttpCode, HttpStatus, UseGuards, 
	Req, Request, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from '../decorator';
import { AuthDto } from "./dto";
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard';
import { FortyTwoAuthGuard } from 'src/auth/guard';
import { UserService } from "src/user/user.service";
import { use } from "passport";


@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {}

	@Post("signup42")
	@UseGuards(FortyTwoAuthGuard)
	async Auth() { console.log({ test: "HELLO!" }); }
	@Get('sign42')
	@UseGuards(FortyTwoAuthGuard)
	async Callback(@Req() req: Request, @Res() res: Response) {
		return await this.authService.forty2signup(req, res);
	}

	@IsPublic(true)
	@Post('signup')
	async signup(@Body() dto:AuthDto, @Res() res: Response) { 
		return this.authService.signup(dto, res);
	}

	@HttpCode(HttpStatus.OK)
	@IsPublic(true)
	@Post('signin')
	async signin(@Body() dto:Partial<AuthDto>, @Res() res: Response) {1
		return this.authService.signin(dto, res);
	}
}
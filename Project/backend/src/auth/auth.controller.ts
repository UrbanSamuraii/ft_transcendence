import { Controller, Post, Get, Res,
	Body, HttpCode, HttpStatus, UseGuards, 
	Req, Request, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from '../decorator';
import { AuthDto } from "./dto";
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { FortyTwoAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {}

	@Get('signup42')
	@UseGuards(FortyTwoAuthGuard)
	async Auth() { }

	@Get('sign42')
	@UseGuards(FortyTwoAuthGuard)
	async Callback(@Req() req: Request, @Res() res: Response) {
		return ( await this.authService.forty2signup(req, res));
	}

	@IsPublic(true)
	@Post('signup')
	async signup(@Body() dto:AuthDto, @Res() res: Response) { 
		return this.authService.signup(dto, res);
	}

	@HttpCode(HttpStatus.OK)
	@IsPublic(true)
	@Post('signin')
	async signin(@Body('email') email: string, @Body('password') password: string, @Res() res: Response) {
		return this.authService.signin(email, password, res);
	}

	// To add the turn on route in the authentication controller
	@Post('2fa/turn-on')
  	@UseGuards(JwtAuthGuard)
	async turnOnTwoFactorAuthentication(@Req() request, @Body() body) {
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			request.user,
		);
		if (!isCodeValid) { 
			throw new UnauthorizedException('Wrong authentication code'); 
		}
		await this.userService.turnOnTwoFactorAuthentication(request.user.id);
	}

	@Post('2fa/generate')
	@UseGuards(JwtAuthGuard)
	async register(@Res() response: ExpressResponse, @Req() request) {
		const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(request.user);
		return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl));
	}

	@HttpCode(200)
	@IsPublic(true)
	@Post('2fa/authenticate')
	@UseGuards(JwtAuthGuard)
	async authenticate(@Request() request, @Body() body) {
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			request.user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		return this.authService.loginWith2fa(request.user);
	}

	@IsPublic(false)
	@Post('signout')
	@UseGuards(Jwt2faAuthGuard)
	async signout(@Request() request, @Res() response: ExpressResponse) { 
		try {	
			response.clearCookie('token');
			return response.status(200).json({ message: 'Logout successful' });
	
		} catch (error) {
			return response.status(500).json({ error: 'Internal server error' });
		}
	}
}
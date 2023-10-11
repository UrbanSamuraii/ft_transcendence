import { Controller, Post, Get, Res,
	Body, HttpCode, HttpStatus, UseGuards, 
	Req, Request, Response, UnauthorizedException } from "@nestjs/common";
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
	async signup(@Req() req, @Res({ passthrough: true }) res: Response) { 
		return (await this.authService.signup(req, res));
	}

	@HttpCode(HttpStatus.OK)
	@IsPublic(true)
	@Post('login')
	@UseGuards(Jwt2faAuthGuard)
	async login(@Body('email') email: string, @Body('password') password: string, @Res() res: Response) {
		return (await this.authService.login(email, password, res));
	}

	// @Post('2fa/token')
	// @UseGuards(Jwt2faAuthGuard)
	// async generateToken(@Response() response, @Request() request) {
	// 	return response.json( await this.authService.generateTwoFactorAuthenticationToken(request.user));
	// }

	@Post('2fa/generate')
	@UseGuards(JwtAuthGuard)
	async register(@Request() request, @Res() response: ExpressResponse) {
		const email = request.user.email;
        const user = await this.userService.getUser({ email });
		const { secret, otpAuthUrl, updatedUser } = await this.authService.generateTwoFactorAuthenticationSecret(user);
		return response.status(201).json({
			updatedUser, // Include the updated user object in the response
			qrCodeUrl: await this.authService.generateQrCodeDataURL(otpAuthUrl)
		  });
	}
	
	// To add the turn on route in the authentication controller
	@Post('2fa/turn-on')
  	@UseGuards(JwtAuthGuard)
	async turnOnTwoFactorAuthentication(@Request() request, @Body() body) {
		const email = request.user.email;
        const myUser = await this.userService.getUser({ email }); 
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			myUser,
		);
		if (!isCodeValid) {
			console.log({"CODE INVALIDE": body.twoFactorAuthenticationCode});
			throw new UnauthorizedException('Wrong authentication code'); 
		}
		await this.userService.turnOnTwoFactorAuthentication(myUser.id);
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

	@Post("2fa/disable")
    @UseGuards(JwtAuthGuard)
    async disableTwoFa(@Request() request, @Res() res: ExpressResponse) {
        const email = request.user.email;
        const myUser = await this.userService.getUser({ email });
		console.log("LETS DISABLE");
		const myUpdateUser = await this.userService.disableTwoFactorAuthentication(myUser);
        return res.status(200).json({ myUpdateUser, message: "success disabled 2fa" });
    }

	@Get('signout')
	@UseGuards(JwtAuthGuard)
	async signout(@Request() request, @Res() res: ExpressResponse) { 
		try {	
			res.clearCookie('token');
			return res.status(200).json({ message: 'Logout successful' });
	
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error' });
		}
	}
}
import { Controller, Post, Get, Res,
	Body, HttpCode, HttpStatus, UseGuards, 
	Req, Request, Response, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from '../decorator';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard';
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { LocalAuthGuard } from 'src/auth/guard';
// import { FortyTwoAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {}

	// @Get('signup42')
	// @UseGuards(FortyTwoAuthGuard)
	// async Auth() { }

	// @Get('sign42')
	// @UseGuards(FortyTwoAuthGuard)
	// async Callback(@Req() req: Request, @Res() res: Response) {
	// 	return ( await this.authService.forty2signup(req, res));
	// }

	@Post('signup')
	async signup(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) { 
		return (await this.authService.signup(req, res));
	}

	@Post('login')
	async login(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		return (await this.authService.login(req, res));
	}

	@Post('2fa/login')
	async loginWith2FA(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		return (await this.authService.loginWith2FA(req, res));
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('signout')
	async signout(@Req() req, @Res() res: ExpressResponse) { 
		// console.log({"SIGNOUT REQUEST": req})
		try {	
			res.clearCookie('token');
			return res.status(200).json({ message: 'Logout successful' });
	
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error' });
		}
	}

	@UseGuards(Jwt2faAuthGuard)
	@Post('2fa/generate')
	async register(@Req() req, @Res() res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req);
		const { secret, otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(user);
		const userUpdated = await this.userService.getUserByToken(req);
		return res.status(200).json({
			user, // Include the updated user object in the response
			qrCodeUrl: await this.authService.generateQrCodeDataURL(otpAuthUrl)
		});
	}
	
	// To add the turn on route in the authentication controller
	// Here the user is using an SignToken (Not a Sign2FAToken)
	@UseGuards(Jwt2faAuthGuard)
	@Post('2fa/turn_on')
	async turnOnTwoFactorAuthentication(@Req() req, @Res() res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req);
		console.log({"STANDARD TOKEN": user.accessToken});
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			req.body.twoFactorAuthenticationCode,
			user,
		);
		if (!isCodeValid) {
			console.log({"CODE INVALIDE": req.body.twoFactorAuthenticationCode});
			throw new UnauthorizedException('Wrong authentication code'); 
		}
		const new2FAToken = await this.authService.sign2FAToken(user.id, user.email);
		const new2FAUser = await this.userService.turnOnTwoFactorAuthentication(user.id, new2FAToken);
		console.log({"NEW 2FA TOKEN": new2FAUser.accessToken});
		res.clearCookie('token');
		return res.status(200).cookie('token', new2FAToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			expires: new Date(Date.now() + 1 * 24 * 60 * 1000),
		}).json({ new2FAUser });;
	}

	// @Post("2fa/disable")
    // @UseGuards(JwtAuthGuard)
    // async disableTwoFa(@Request() request, @Res() res: ExpressResponse) {
    //     const email = request.user.email;
    //     const myUser = await this.userService.getUser({ email });
	// 	console.log("LETS DISABLE");
	// 	const myUpdateUser = await this.userService.disableTwoFactorAuthentication(myUser);
    //     return res.status(200).json({ myUpdateUser, message: "success disabled 2fa" });
    // }

}
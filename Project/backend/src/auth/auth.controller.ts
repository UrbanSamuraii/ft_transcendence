import { Controller, Post, Get, Res, UseGuards, 
	Req, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { FortyTwoAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {}

	@UseGuards(FortyTwoAuthGuard)
	@Get('signup42')
	async FortyTwoLogin() { }

	@UseGuards(FortyTwoAuthGuard)
	@Get('sign42')
	async FortyTwoRedirect(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		return ( await this.authService.forty2signup(req, res));
	}

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
		console.log({"REQ.BODY for 2FA login": req.body});
		return (await this.authService.loginWith2FA(req, res));
	}

	@UseGuards(Jwt2faAuthGuard)
	@Get('signout')
	async signout(@Req() req, @Res() res: ExpressResponse) { 
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

	@UseGuards(Jwt2faAuthGuard)
	@Post('2fa/turn_on')
	async turnOnTwoFactorAuthentication(@Req() req, @Res() res: ExpressResponse) {
		const user = await this.userService.getUserByToken(req);
		return (await this.authService.turnOnTwoFactorAuthentication(req, res, user));
	}

    @UseGuards(Jwt2faAuthGuard)
	@Post("2fa/turn_off")
    async disableTwoFa(@Request() req, @Res() res: ExpressResponse) {
        const user = await this.userService.getUserByToken(req);
		return (await this.authService.turnOffTwoFactorAuthentication(req, res, user));
	}

}
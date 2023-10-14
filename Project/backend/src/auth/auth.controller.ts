import { Controller, Post, Get, Res,
	Body, HttpCode, HttpStatus, UseGuards, 
	Req, Request, Response, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from '../decorator';
// import { AuthDto } from "./dto";
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard';
// import { Jwt2faAuthGuard } from 'src/auth/guard';
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

	// Out first pass on /login will not generate token but will check credentials only
	// Local guard ? -> MUST FURNISH THE mail AND PASSWORD in the request
	// OR PROTECTING THIS ROUTE IN THE FRONT : CAN T ACCESS login/2fa without getting login first
	@Post('login/2fa')
	async loginWith2FA(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
		return (await this.authService.loginWith2FA(req, res));
	}

	@UseGuards(JwtAuthGuard)
	@Get('signout')
	async signout(@Req() req, @Res() res: ExpressResponse) { 
		console.log({"SIGNOUT REQUEST": req})
		try {	
			res.clearCookie('token');
			return res.status(200).json({ message: 'Logout successful' });
	
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error' });
		}
	}

	// @Post('2fa/token')
	// @UseGuards(Jwt2faAuthGuard)
	// async generateToken(@Response() response, @Request() request) {
	// 	return response.json( await this.authService.generateTwoFactorAuthenticationToken(request.user));
	// }

	// @Post('2fa/generate')
	// @UseGuards(JwtAuthGuard)
	// async register(@Request() request, @Res() response: ExpressResponse) {
	// 	const email = request.user.email;
	// 	const user = await this.userService.getUser({ email });
	// 	const { secret, otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(user);
	// 	return response.status(201).json({
	// 		// updatedUser, // Include the updated user object in the response
	// 		qrCodeUrl: await this.authService.generateQrCodeDataURL(otpAuthUrl)
	// 	});
	// }
	
	// To add the turn on route in the authentication controller
	// Here the user is using an SignToken (Not a Sign2FAToken)
	@UseGuards(JwtAuthGuard)
	@Post('2fa/turn-on')
	async turnOnTwoFactorAuthentication(@Req() req, @Res() res: ExpressResponse) {
		const email = req.user.email;
		const myUser = await this.userService.getUser({ email }); 
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			req.body.twoFactorAuthenticationCode,
			myUser,
		);
		if (!isCodeValid) {
			console.log({"CODE INVALIDE": req.body.twoFactorAuthenticationCode});
			throw new UnauthorizedException('Wrong authentication code'); 
		}
		await this.userService.turnOnTwoFactorAuthentication(myUser.id);
	}

	// @Post('2fa/authenticate')
	// @HttpCode(200)
	// @UseGuards(JwtAuthGuard)
	// async authenticate(@Request() request, @Body() body) {
	// 	const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
	// 		body.twoFactorAuthenticationCode,
	// 		request.user,
	// 	);
	// 	if (!isCodeValid) {
	// 		throw new UnauthorizedException('Wrong authentication code');
	// 	}
	// 	return this.authService.loginWith2fa(request.user);
	// }

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
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
		// console.log('Received signup request:', req.body);
		return (await this.authService.signup(req, res));
	}

	@HttpCode(HttpStatus.OK)
	@IsPublic(true)
	@Post('signin')
	@UseGuards(Jwt2faAuthGuard)
	async signin(@Body('email') email: string, @Body('password') password: string, @Res() res: Response) {
		return (await this.authService.signin(email, password, res));
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
		console.log({"MY USER after 2fa/generate": updatedUser});
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
		console.log({"MY USER when 2fa/turn-on ": myUser});
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			body.twoFactorAuthenticationCode,
			myUser,
		);
		if (!isCodeValid) { 
			throw new UnauthorizedException('Wrong authentication code'); 
		}
		await this.userService.turnOnTwoFactorAuthentication(myUser.id);
	}

	@HttpCode(200)
	@IsPublic(true)
	@Post('2fa/authenticate')
	@UseGuards(JwtAuthGuard)
	async authenticate(@Request() request, @Body() body) {
		console.log({"body for 2fa authenticate": body});
		console.log({"REQUEST for 2fa authenticate": request});
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
    @UseGuards(Jwt2faAuthGuard)
    async disableTwoFa(@Request() request, @Res() res: ExpressResponse) {
        await this.userService.disableTwoFactorAuthentication(request.user);
        return res.status(201).json({ message: "success disabled 2fa authentication mode" });
    }

	@Get('signout')
	@UseGuards(Jwt2faAuthGuard)
	async signout(@Request() request, @Res() res: ExpressResponse) { 
		try {	
			// console.log({'REQUEST' : request});
			res.clearCookie('token');
			return res.status(200).json({ message: 'Logout successful' });
	
		} catch (error) {
			return res.status(500).json({ error: 'Internal server error' });
		}
	}
}
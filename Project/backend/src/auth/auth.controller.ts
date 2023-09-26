import { Controller, Post, Res, Response, Body, HttpCode, HttpStatus, UseGuards, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from '../decorator';
import { AuthDto } from "./dto";
import { TwoFactorDto } from "./dto";
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard';
import { UserService } from "src/user/user.service";
import { use } from "passport";


@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {}

	// signup - create account - Creates a new user email/username/password
	@IsPublic(true)
	@Post('signup')
	signup(@Body() dto:AuthDto, @Res() res: Response) { 
	  return this.authService.signup(dto, res);
	}

	// signin - sign in to API - Signs an existing user email/username and password
	@HttpCode(HttpStatus.OK) // When we signin we don t create any ressource -> 200 code return
	@IsPublic(true)
	@Post('signin')
	signin(@Body() dto:Partial<AuthDto>, @Res() res: Response) {1
		return this.authService.signin(dto, res);
	}

	@Post('2fa/generate')
	@UseGuards(JwtAuthGuard)
	async register(@Body() dto:Partial<AuthDto>) {
		const user = await this.userService.getUserByEmail(dto.email);
		const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(user);

		return { qrCodeDataUrl: await this.authService.generateQrCodeDataURL(otpAuthUrl) };
	}

	@Post('2fa/turn-on')
	@UseGuards(JwtAuthGuard)
	async turnOnTwoFactorAuthentication(@Body() dto:TwoFactorDto) {
		const user = await this.userService.getUserByEmail(dto.email);
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			dto.secret,
			user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.turnOnTwoFactorAuthentication(user.id);
  	}

	@Post('2fa/authenticate')
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	async authenticate(@Body() dto:TwoFactorDto) {
		const user = await this.userService.getUserByEmail(dto.email);
		const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
			dto.secret,
			user,
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		return this.authService.loginWith2fa(user);
	}

}
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { IsPublic } from '../decorator';
import { AuthDto } from "./dto";
import { TwoFactorDto } from "./dto";
import { AuthGuard } from '@nestjs/passport';
import { JwtGuard } from 'src/auth/guard';
import { UserService } from "src/user/user.service";
import { use } from "passport";


@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService, private userService: UserService) {}

	// signup - create account - Creates a new user email/username/password
	@IsPublic(true)
	@Post('signup')
	signup(@Body() dto:AuthDto) { 
	  return this.authService.signup(dto);
	}

	// signin - sign in to API - Signs an existing user email/username and password
	@HttpCode(HttpStatus.OK) // When we signin we don t create any ressource -> 200 code return
	@IsPublic(true)
	@Post('signin')
	signin(@Body() dto:AuthDto) {
		return this.authService.signin(dto);
	}

	@Post('2fa/generate')
	@UseGuards(JwtGuard)
	async register(@Body() dto:AuthDto) {
		const user = await this.userService.getUserByEmail(dto.email);
		const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(user);

		return { qrCodeDataUrl: await this.authService.generateQrCodeDataURL(otpAuthUrl) };
	}

	@Post('2fa/turn-on')
	@UseGuards(JwtGuard)
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
	@UseGuards(JwtGuard)
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
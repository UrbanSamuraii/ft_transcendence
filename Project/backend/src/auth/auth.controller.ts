import {
    Controller, Post, Get, Res, UseGuards,
    Req, Request, Param
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Jwt2faAuthGuard } from 'src/auth/guard';
import { FortyTwoAuthGuard } from 'src/auth/guard';
import { Response as ExpressResponse } from 'express';
import { UserService } from "src/user/user.service";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService, private userService: UserService) { }

    @UseGuards(FortyTwoAuthGuard)
    @Get('signup42')
    async FortyTwoLogin() { }

    @UseGuards(FortyTwoAuthGuard)
    @Get('sign42')
    async FortyTwoRedirect(@Req() req, @Res({ passthrough: true }) res: ExpressResponse) {
        return (await this.authService.forty2signup(req, res));
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
        const user = await this.userService.getUserByToken(req.cookies.token);
        const { secret, otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(user);
        const userUpdated = await this.userService.getUserByToken(req.cookies.token);
        return res.status(200).json({
            user, // Include the updated user object in the response
            qrCodeUrl: await this.authService.generateQrCodeDataURL(otpAuthUrl)
        });
    }

    @UseGuards(Jwt2faAuthGuard)
    @Post('2fa/turn_on')
    async turnOnTwoFactorAuthentication(@Req() req, @Res() res: ExpressResponse) {
        const user = await this.userService.getUserByToken(req.cookies.token);
        return (await this.authService.turnOnTwoFactorAuthentication(req, res, user));
    }

    @UseGuards(Jwt2faAuthGuard)
    @Post("2fa/turn_off")
    async disableTwoFa(@Request() req, @Res() res: ExpressResponse) {
        const user = await this.userService.getUserByToken(req.cookies.token);
        return (await this.authService.turnOffTwoFactorAuthentication(req, res, user));
    }

    @UseGuards(Jwt2faAuthGuard) // To make sure the user is authenticated !
    @Get('me')
    async getMe(@Request() req) {
        const me = await this.userService.getUserByToken(req.cookies.token);
        delete me.hash;
        delete me.accessToken;
        return me;
    }

    // @UseGuards(Jwt2faAuthGuard)
    @Get('user-info')
    async getUserInfo(@Req() req, @Res() res: ExpressResponse) {
        try {
            const user = await this.userService.getUserByToken(req.cookies.token);
            // Send back only the necessary user information
            return res.status(200).json({
                username: user.username,
                email: user.email,
                // other fields you want to include 
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    @Get('user-info/:username')
    async getUserInfoDynamic(@Param('username') username: string, @Res() res: ExpressResponse) {
        try {
            const user = await this.userService.getUserByUsername(username); // Assuming you have a method to get user by username
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Send back only the necessary user information
            return res.status(200).json({
                username: user.username,
                email: user.email,
                totalGamesWon: user.totalGamesWon,
                totalGamesLost: user.totalGamesLost,
                eloRating: user.eloRating

                // other fields you want to include
            });
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Endpoint for global leaderboard
    @Get('/leaderboard')
    async getGlobalLeaderboard() {
        return this.userService.getGlobalLeaderboard();
    }

    // Endpoint for user-specific leaderboard
    @Get('/leaderboard/:username')
    async getUserLeaderboard(@Param('username') username: string) {
        return this.userService.getUserLeaderboard(username);
    }
}

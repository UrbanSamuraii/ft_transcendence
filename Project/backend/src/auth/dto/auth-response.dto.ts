export class AuthResponseDto {
	token: string;
	cookieOptions: {
	  httpOnly: boolean;
	  secure: boolean;
	  sameSite: string;
	  expires: Date;
	};
  }
  
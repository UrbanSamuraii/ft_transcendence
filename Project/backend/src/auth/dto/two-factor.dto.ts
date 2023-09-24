import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class TwoFactorDto {	
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	secret: string;
}

import { IsEmail, IsNotEmpty, IsString, IsNumber, MaxLength, MinLength } from "class-validator"

export class AuthDto {	
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	password: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(10)
	@MinLength(4)
	username: string;

	@IsNotEmpty()
	id42: string;
}

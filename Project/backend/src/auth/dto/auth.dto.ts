import { IsEmail, IsNotEmpty, IsString, IsNumber, MaxLength, MinLength } from "class-validator"

export class AuthDto {	
	@IsEmail()
	@IsNotEmpty()
	email: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(20)
	@MinLength(4)
	username: string;
	
	@IsString()
	@IsNotEmpty()
	first_name: string;

	@IsString()
	@IsNotEmpty()
	last_name: string;

	@IsString()
	@IsNotEmpty()
	password: string;
}

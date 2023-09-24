import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class EdithUserDto {
	@IsEmail()
	@IsOptional()
	email?: string;
	@IsString()
	@IsOptional()
	username?: string;
};
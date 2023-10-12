export interface TokenPayload {
	iat: number;
	exp: number;
	email: string;
	// isTwoFactorAuthenticated?: boolean;
	is_two_factor_activate: boolean;
	isTwoFactorAuthenticationEnabled: boolean;
}
import { LoginForm } from "../components/forms/LoginForm";
import { Page } from "../utils/styles"

export const LoginPage = () => {
	return( 
		<Page display="flex" justifycontent="center" alignitems="center">
			<LoginForm/>
		</Page>
	);
};
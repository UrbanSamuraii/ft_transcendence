import { RegisterForm } from "../components/forms/RegisterForm";
import { Page } from "../utils/styles"

export const AuthenticationPage = () => {
	return( 
		<Page display="flex" justifycontent="center" alignitems="center">
			<RegisterForm/>
		</Page>
	);
};
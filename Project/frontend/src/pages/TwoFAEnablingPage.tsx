import { TwoFAEnablingForm } from "../components/forms/TwoFAEnablingForm";
import { Page } from "../utils/styles"

export const TwoFAEnablingPage = () => {
	return( 
		<Page display="flex" justifycontent="center" alignitems="center">
			<TwoFAEnablingForm/>
		</Page>
	);
};
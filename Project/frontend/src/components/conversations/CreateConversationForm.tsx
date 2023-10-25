import { InputField } from "../../utils/styles";
import { useState } from "react";

interface ConvData {
	name: string;
	users: [];
}

export const CreateConversationForm = () => {

	const [ConvData, setConvData] = useState<ConvData>({
		name: '',
		users: [],
	  });
	
	const [formErrors, setFormErrors] = useState<Partial<ConvData>>({});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setConvData((prevData) => ({
		  ...prevData,
		  [name]: value,
		}));
		setFormErrors((prevErrors) => ({
		  ...prevErrors,
		  [name]: '',
		}));
	};

	return <form>

	</form>
};
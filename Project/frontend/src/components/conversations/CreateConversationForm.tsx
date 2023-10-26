import { useState } from "react";
import { ButtonCreateConv, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './GlobalConversations.css'

interface ConvDataInput {
	name: string;
	users: string;
}

interface ConvData {
	name: string;
	users: string[];
}

export const CreateConversationForm = () => {

	const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
		name: '',
		users: '',
	  });
	
	const [formErrors, setFormErrors] = useState<Partial<ConvDataInput>>({});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = event.target;
		setConvDataInput((prevData) => ({
		  ...prevData,
		  [name]: value,
		}));
		setFormErrors((prevErrors) => ({
		  ...prevErrors,
		  [name]: '',
		}));
	};

	const handleCreateConversation = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<ConvDataInput> = {};
		if (!ConvDataInput.name) {
		  newErrors.name = 'Name is required';
		}
		if (!ConvDataInput.users) {
			newErrors.users = 'At least one user is required';
		}
		if (Object.keys(newErrors).length > 0) {
		  setFormErrors(newErrors);
		} 
		else {
			try {
				console.log({"DATA" : ConvDataInput});
				}
			catch (error) {
				console.error('Sign in request error:', error);
			}
		}
	  };

	return (
		<form className="form-Create-Conversation" onSubmit={handleCreateConversation}>
			<h2>New Conversation</h2>
			
			<div className="input-createConv-container">
				<InputContainer>
					<InputLabel htmlFor="Conversation Name">
						Conversation Name
						<InputField
						type="text" name="name" value={ConvDataInput.name} onChange={handleInputChange} />
						{formErrors.name && <div className="error-message">{formErrors.name}</div>}
					</InputLabel>
				</InputContainer>
			</div>

			<div className="input-createConv-container">
				<InputContainer>
					<InputLabel htmlFor="Username(s) or email(s) of the member(s)">
						Username(s) or email(s) of the member(s)		
						<InputField
						type="text" name="users" value={ConvDataInput.users} onChange={handleInputChange} />
						{formErrors.users && <div className="error-message">{formErrors.users}</div>}
					</InputLabel>
				</InputContainer>
			</div>

			<div className="button-createConv-container">
				<ButtonCreateConv type="submit" >Create Conversation</ButtonCreateConv>
			</div>

		</form>
	);
};
import { useState } from "react";
import { ButtonCreateConv, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './GlobalConversations.css'
import axios from 'axios';
import { resolvePath } from "react-router-dom";
import { useNavigate } from "react-router-dom";


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

	const navigate = useNavigate();

	const handleCreateConversation = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<ConvDataInput> = {};
		if (!ConvDataInput.name) {
		  newErrors.name = 'Name is required';
		}
		// if (!ConvDataInput.users) {
		// 	newErrors.users = 'At least one user is required';
		// }
		if (Object.keys(newErrors).length > 0) {
		  setFormErrors(newErrors);
		} 
		else {
			try {
				console.log({"DATA" : ConvDataInput});
				const response = await axios.post('http://localhost:3001/conversations/create', ConvDataInput, {
					withCredentials: true });
				console.log({"RESPONSE from creating CONVERSATION": response}); 
				if (response.status === 403) {
					const customWarning = response.data.message;
					alert(`Warning: ${customWarning}`);
				} else if (response.status === 201) {
					// Successfully created a conversation, navigate to it
					const conversationId = response.data.conversationId;
					navigate(`channel/${conversationId}`);
				}
			} catch (error) {
				console.error('Creating conversation error:', error);
				if (axios.isAxiosError(error)) {
					if (error.response && error.response.data) {
						const customError = error.response.data.message;
						if (customError) {
							alert(`Error: ${customError}`);
						}
					}
				}
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
import { useState } from "react";
import { useParams } from "react-router-dom";
import { ButtonCreateConv, InputContainer, InputField, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import { useNavigate } from "react-router-dom";

interface ConvDataInput {
	userToAdd: string;
}

type AddMemberToConversationFormProps = {
    setShowModal: (show: boolean) => void;
};

export const AddMemberToConversationForm: React.FC<AddMemberToConversationFormProps> = ({ setShowModal }) => {

	const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
		userToAdd: '',
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
	const conversationId = useParams().id;

	const handleJoinConversation = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<ConvDataInput> = {};
		if (!ConvDataInput.userToAdd) {
			newErrors.userToAdd = 'Username is required';
		}
		if (Object.keys(newErrors).length > 0) {
		  setFormErrors(newErrors);
		} 
		else {
			try {
				console.log({"DATA" : ConvDataInput});
				const response = await axios.post(`http://localhost:3001/conversations/${conversationId}/add_member`, ConvDataInput, {
        			withCredentials: true });
				console.log({"RESPONSE from ADDING USER TO CONVERSATION": response}); 
				if (response.status === 403) {
					const customWarning = response.data.message;
					alert(`Warning: ${customWarning}`);
				} 
				setShowModal(false);
			} catch (error) {
				console.error('Adding user to conversation error:', error);
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
		<form className="form-Create-Conversation" onSubmit={handleJoinConversation}>
			<h2>Add User to the Conversation</h2>
			
			<div className="input-createConv-container">
				<InputContainer>
					<InputLabel htmlFor="Conversation Name">
						Username or email
						<InputField
						type="text" name="userToAdd" value={ConvDataInput.userToAdd} onChange={handleInputChange} />
						{formErrors.userToAdd && <div className="error-message">{formErrors.userToAdd}</div>}
					</InputLabel>
				</InputContainer>
			</div>


			<div className="button-createConv-container">
				<ButtonCreateConv type="submit" >Add User</ButtonCreateConv>
			</div>

		</form>
	);
};
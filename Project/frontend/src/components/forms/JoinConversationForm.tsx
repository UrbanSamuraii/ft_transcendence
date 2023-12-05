import { useState } from "react";
import { ButtonCreateConv, InputContainer, InputField, ButtonAddUser, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import { useNavigate } from "react-router-dom";

interface ConvDataInput {
	conversationName: string;
}

type JoinConversationFormProps = {
    setShowModal: (show: boolean) => void;
};

export const JoinConversationForm: React.FC<JoinConversationFormProps> = ({ setShowModal }) => {

	const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
		conversationName: '',
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

	const handleJoinConversation = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<ConvDataInput> = {};
		if (!ConvDataInput.conversationName) {
			newErrors.conversationName = 'Conversation Name is required';
		}
		if (Object.keys(newErrors).length > 0) {
		  setFormErrors(newErrors);
		} 
		else {
			try {
				console.log({"DATA" : ConvDataInput});
				const response = await axios.post('http://localhost:3001/conversations/join', ConvDataInput, {
					withCredentials: true });
				console.log({"RESPONSE from JOIGNING CONVERSATION": response}); 
				if (response.status === 403) {
					const customWarning = response.data.message;
					alert(`Warning: ${customWarning}`);
				} else {
					const conversationId = response.data.conversationId;
					setShowModal(false);
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
		<form className="form-Create-Conversation" onSubmit={handleJoinConversation}>
			<h2>Join Conversation</h2>
			
			<div className="input-createConv-container">
				<InputContainer>
					<InputLabel htmlFor="Conversation Name">
						Conversation Name
						<InputField
						type="text" name="conversationName" value={ConvDataInput.conversationName} onChange={handleInputChange} />
						{formErrors.conversationName && <div className="error-message">{formErrors.conversationName}</div>}
					</InputLabel>
				</InputContainer>
			</div>


			<div className="button-createConv-container">
				<ButtonCreateConv type="submit" >Join Conversation</ButtonCreateConv>
			</div>

		</form>
	);
};
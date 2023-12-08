import { useState } from "react";
import { useParams } from "react-router-dom";
import { ButtonCreateConv, InputContainer, InputField, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';

interface ConvDataInput {
	newPassword: string;
	disablePassword: boolean;
}

type SetUpNewPasswordFormProps = {
    setShowModal: (show: boolean) => void;
};

export const ImplementNewPasswordForm: React.FC<SetUpNewPasswordFormProps> = ({ setShowModal }) => {

	const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
		newPassword: '',
		disablePassword: false,
	  });

	const [formErrors, setFormErrors] = useState<Partial<ConvDataInput>>({});

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = event.target;
	  
		if (type === 'checkbox') {
		  setConvDataInput((prevData) => ({
			...prevData,
			[name]: checked,
		  }));
	  
		  if (checked) {
			handleDisablePassword();
		  }
		} else {
		  setConvDataInput((prevData) => ({
			...prevData,
			[name]: value,
		  }));
		}
	  
		setFormErrors((prevErrors) => ({
		  ...prevErrors,
		  [name]: '',
		}));
	  };

	const conversationId = useParams().id;

	const handleNewPasswordConversation = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<ConvDataInput> = {};
		if (!ConvDataInput.newPassword) {
			newErrors.newPassword = 'New Password is required. To disable protection, please disable password';
		}
		if (Object.keys(newErrors).length > 0) {
		  setFormErrors(newErrors);
		} 
		else {
			try {
				// console.log({"DATA" : ConvDataInput});
				const response = await axios.post(`http://localhost:3001/conversations/${conversationId}/set_newPassword`, ConvDataInput, {
        			withCredentials: true });
				// console.log({"RESPONSE from SETTING UP A NEW PASSWORD": response}); 
				if (response.status === 403) {
					const customWarning = response.data.message;
					alert(`Warning: ${customWarning}`);
				} 
				setShowModal(false);
			} catch (error) {
				console.error('Setting up new password to conversation error:', error);
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

	const handleDisablePassword = async () => {
		try {
		  const response = await axios.post(`http://localhost:3001/conversations/${conversationId}/set_newPassword`, { newPassword: null },
			{ withCredentials: true });
		//   console.log({ "RESPONSE_DISABLE_PASSWORD": response });
		  if (response.status === 403) {
			const customWarning = response.data.message;
			alert(`Warning: ${customWarning}`);
		} 
		  setShowModal(false);
		} catch (error) {
		  console.error('Error disabling password:', error);
		}
	  };

	return (
		<form className="form-Create-Conversation" onSubmit={handleNewPasswordConversation}>
			<h2>New Password</h2>
			
			<div className="input-createConv-container">
				<InputContainer>
					<InputLabel htmlFor="Conversation Name">
						
						<InputField
						type="text" name="newPassword" value={ConvDataInput.newPassword} onChange={handleInputChange} />
						{formErrors.newPassword && <div className="error-message">{formErrors.newPassword}</div>}
					</InputLabel>
				</InputContainer>
			</div>


			<div className="button-createConv-container">
				<ButtonCreateConv type="submit" >Implement New Password</ButtonCreateConv>
			</div>

			<div className="disable-password-checkbox">
				<input
					type="checkbox"
					id="disablePasswordCheckbox"
					name="disablePassword"
					checked={ConvDataInput.disablePassword}
					onChange={handleInputChange}
					/>
				<label htmlFor="disablePasswordCheckbox">Disable Password</label>
			</div>

		</form>
	);
};
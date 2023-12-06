import { useState } from "react";
import { useParams } from "react-router-dom";
import { ButtonCreateConv, InputContainer, InputField, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import { ImplementNewPasswordModal } from "../modals/ImplementNewPasswordModal";

interface ConvDataInput {
	password: string;
}

type VerifyPasswordFormFormProps = {
    setShowModal: (show: boolean) => void;
};

export const VerifyPasswordForm: React.FC<VerifyPasswordFormFormProps> = ({ setShowModal }) => {

	
	const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
	const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
		password: '',
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

	const conversationId = useParams().id;

	const handleVerifyPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		const newErrors: Partial<ConvDataInput> = {};
		if (!ConvDataInput.password) {
			newErrors.password = 'Password is required';
		}
		if (Object.keys(newErrors).length > 0) {
		  setFormErrors(newErrors);
		} 
		else {
			try {
				console.log({"DATA" : ConvDataInput});
				const response = await axios.post(`http://localhost:3001/conversations/${conversationId}/verify_password`, ConvDataInput, {
        			withCredentials: true });
				console.log({"RESPONSE from VERIFYING PASSWORD": response}); 
				if (response.status === 403) {
					const customWarning = response.data.message;
					alert(`Warning: ${customWarning}`);
				} 
				setShowNewPasswordModal(true); 
				// setShowModal(false);
			} catch (error) {
				console.error('Verify password conversation error:', error);
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
		<>
		{showNewPasswordModal && (<ImplementNewPasswordModal
			setShowModal={() => {
				setShowNewPasswordModal(false);
				setShowModal(false);
			}} /> )}
		<form className="form-Create-Conversation" onSubmit={handleVerifyPassword}>
			<h2>Password Verification</h2>
			
			<div className="input-createConv-container">
				<InputContainer>
					<InputLabel htmlFor="Conversation Name">
						Please enter the Password
						<InputField
						type="text" name="password" value={ConvDataInput.password} onChange={handleInputChange} />
						{formErrors.password && <div className="error-message">{formErrors.password}</div>}
					</InputLabel>
				</InputContainer>
			</div>


			<div className="button-createConv-container">
				<ButtonCreateConv type="submit" >Submit</ButtonCreateConv>
			</div>

		</form>
		</>
	);
};
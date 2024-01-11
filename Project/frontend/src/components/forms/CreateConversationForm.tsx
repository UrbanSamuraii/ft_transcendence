import { useState } from "react";
import { ButtonCreateConv, InputContainer, InputField, ButtonAddUser, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
const server_adress = process.env.REACT_APP_SERVER_ADRESS;

interface ConvDataInput {
    name: string;
    users: string[];
    currentUsername: string;
}

type CreateConversationFormProps = {
    setShowModal: (show: boolean) => void;
};

export const CreateConversationForm: React.FC<CreateConversationFormProps> = ({ setShowModal }) => {

    const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
        name: '',
        users: [],
        currentUsername: ''
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

    const handleAddUser = () => {
        // console.log("ADD USER:");
        // console.log({"username INPUT FORM": ConvDataInput.currentUsername});
        if (ConvDataInput.currentUsername.trim() !== '') {
            setConvDataInput((prevData) => ({
                ...prevData,
                users: [...prevData.users, prevData.currentUsername],
                currentUsername: ''
            }));
        }
    };

    const navigate = useNavigate();

    const handleCreateConversation = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<ConvDataInput> = {};
        if (!ConvDataInput.name || ConvDataInput.users.length === 0) {
            newErrors.name = 'Conversation Name is required';
            newErrors.currentUsername = 'At least one User is required';
        }
        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
        }
        else {
            try {
                // console.log({"DATA" : ConvDataInput});
                const response = await axios.post(`http://${server_adress}:3001/conversations/create`, ConvDataInput, {
                    withCredentials: true
                });
                // console.log({"RESPONSE from creating CONVERSATION": response}); 
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
                            type="text" name="currentUsername" value={ConvDataInput.currentUsername} onChange={handleInputChange} />
                    </InputLabel>
                    <ButtonAddUser type="button" onClick={handleAddUser}>
                        Add User
                    </ButtonAddUser>
                    {formErrors.currentUsername && <div className="error-message">{formErrors.currentUsername}</div>}
                </InputContainer>
            </div>

            <div className="button-createConv-container">
                <ButtonCreateConv type="submit" >Create Conversation</ButtonCreateConv>
            </div>

        </form>
    );
};
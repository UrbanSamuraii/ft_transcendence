import { useState } from "react";
import { ButtonCreateConv, InputContainer, InputFieldCCF, ButtonAddUser, InputLabel } from '../../utils/styles';
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
        console.log("Input change detected", value);
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
        // console.log("Conv Data Input name", ConvDataInput.name);
        // console.log("Conv Data Input users length", ConvDataInput.users);
        const newErrors: Partial<ConvDataInput> = {};
        if (!ConvDataInput.name) { newErrors.name = 'Conversation Name is required'; }
        else if (ConvDataInput.users.length === 0) { newErrors.currentUsername = 'At least one User is required'; }
        if (Object.keys(newErrors).length > 0) { setFormErrors(newErrors); }
        else {
            try {
                // console.log({"DATA" : ConvDataInput});
                const response = await axios.post('http://localhost:3001/conversations/create', ConvDataInput, {
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
            <h2>new chat</h2>

            <div className="input-createConv-container">
                <InputContainer>
                    <InputLabel htmlFor="Conversation Name">
                        enter chat name
                        <InputFieldCCF
                            className='lets-try-this' type="text" name="name" value={ConvDataInput.name} onChange={handleInputChange} />
                        {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                    </InputLabel>
                </InputContainer>
            </div>

            <div className="input-createConv-container">
                <InputContainer>
                    <InputLabel htmlFor="Username(s) or email(s) of the member(s)">
                        Username(s) or email(s) of the member(s)
                        <InputFieldCCF
                            type="text" name="currentUsername" value={ConvDataInput.currentUsername} onChange={handleInputChange} />
                    </InputLabel>
                    {formErrors.currentUsername && <div className="error-message">{formErrors.currentUsername}</div>}
                </InputContainer>
                <button className="button-add-user" type="button" onClick={handleAddUser}>
                    Add User
                </button>
            </div>

            <div className="button-createConv-container">
                <ButtonCreateConv type="submit" >create chat</ButtonCreateConv>
            </div>

        </form>
    );
};

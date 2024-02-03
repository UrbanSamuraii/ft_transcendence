import { useState } from "react";
import { ButtonCreateConv, InputContainer, InputFieldCCF, ButtonAddUser, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import  { AxiosError } from 'axios';
import { useNavigate } from "react-router-dom";
import DOMPurify from 'dompurify';
import { ErrorConversationMessageModal } from "../modals/ErrorConversationMessageModal";

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

    const [formMsgError, setFormMsgError] = useState<Partial<FormData>>({});
    const [customError, setCustomError] = useState<string>('');
    const [showModalError, setShowModalError] = useState<boolean>(false);
    
    const handleCustomAlertClose = () => {
        setCustomError('');
    };

    const handleShowModalError = () => {
        setShowModalError(true);
    };

    const handleCloseModalError = () => {
        setShowModalError(false);
    };

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
        if (!ConvDataInput.name) { newErrors.name = 'Conversation Name is required'; }
        else if (ConvDataInput.users.length === 0) { newErrors.currentUsername = 'At least one User is required'; }
        if (Object.keys(newErrors).length > 0) { setFormErrors(newErrors); }
        else {
            try {
                const sanitizedName = DOMPurify.sanitize(ConvDataInput.name);
                const sanitizedUsers = ConvDataInput.users.map(user => DOMPurify.sanitize(user));
                const sanitizedConvDataInput = {
                    ...ConvDataInput,
                    name: sanitizedName,
                    users: sanitizedUsers,
                };
                const response = await axios.post(`http://${process.env.REACT_APP_SERVER_ADRESS}:3001/conversations/create`, sanitizedConvDataInput, {
                    withCredentials: true
                });
                if (response.status === 403) {
                    const customWarning = response.data.message;
                    alert(`Warning: ${customWarning}`);
                } else {
                    const conversationId = response.data.conversationId;
                    setShowModal(false);
                    navigate(`channel/${conversationId}`);
                }
            } catch (error) {
                const err = error as AxiosError;
                if (axios.isAxiosError(error)) {
                    console.log(err.response);
                    if (error.response && error.response.data) {
                        if (error.response.data.message) { 
                            const receivedCustomError: string = error.response.data.message;
                            setCustomError(receivedCustomError);}
                        else { 
                            const receivedCustomError: string = error.response.data.error; 
                            setCustomError(receivedCustomError);}
                        handleShowModalError();
                    }
                }
            }
        }
    };

    return (
        <>
        {customError && showModalError && <ErrorConversationMessageModal setShowModalError={handleCloseModalError} errorMessage={customError} />}
        <form className="form-Create-Conversation" onSubmit={handleCreateConversation}>
            <h2>new chat</h2>

            <div className="input-createConv-container">
                <InputContainer>
                    <InputLabel htmlFor="Conversation Name">
                        enter chat name
                        <InputFieldCCF maxLength={10}
                            className='lets-try-this' type="text" name="name" value={ConvDataInput.name} onChange={handleInputChange} />
                        {formErrors.name && <div className="error-message">{formErrors.name}</div>}
                    </InputLabel>
                </InputContainer>
            </div>

            <div className="input-createConv-container">
                <InputContainer>
                    <InputLabel htmlFor="Username(s) or email(s) of the member(s)">
                        Username(s) or email(s) of the member(s)
                        <InputFieldCCF maxLength={30}
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
        </>
    );
};

import { useState, useEffect } from "react";
import { ButtonCreateConv, InputContainer, InputFieldCCF, ButtonAddUser, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { CheckPasswordModal } from "../modals/CheckPasswordModal";
const server_adress = process.env.REACT_APP_SERVER_ADRESS;

interface ConvDataInput {
    conversationName: string;
}

type JoinConversationFormProps = {
    setShowModal: (show: boolean) => void;
};

export const JoinConversationForm: React.FC<JoinConversationFormProps> = ({ setShowModal }) => {

    const [showCheckPasswordModal, setShowCheckPasswordModal] = useState(false);
    const [convId, setConversationId] = useState<number | null>(null);
    // let convId: number | null = null;
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
                // console.log({"DATA" : ConvDataInput});
                const response = await axios.post(`http://${server_adress}:3001/conversations/join`, ConvDataInput, {
                    withCredentials: true
                });
                // console.log({"RESPONSE from JOIGNING CONVERSATION": response}); 
                if (response.status === 403) {
                    const customWarning = response.data.message;
                    alert(`Warning: ${customWarning}`);
                }
                else if (response.status === 202) {
                    // console.log("There is a password protecting the conversation");
                    const id = response.data.conversationId;
                    setConversationId(id);
                    // convId = id;
                    // console.log("Id of the protected conversation : ", convId);
                    setShowCheckPasswordModal(true);
                    // setShowModal(false);
                }
                else {
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
        <>
            {showCheckPasswordModal && convId !== null && (<CheckPasswordModal
                setShowModal={() => {
                    setShowCheckPasswordModal(false);
                    setShowModal(false);
                }} convId={convId} />)}
            <form className="form-Create-Conversation" onSubmit={handleJoinConversation}>
                <h2>Join Conversation</h2>

                <div className="input-createConv-container">
                    <InputContainer>
                        <InputLabel htmlFor="Conversation Name">
                            Conversation Name
                            <InputFieldCCF
                                type="text" name="conversationName" value={ConvDataInput.conversationName} onChange={handleInputChange} />
                            {formErrors.conversationName && <div className="error-message">{formErrors.conversationName}</div>}
                        </InputLabel>
                    </InputContainer>
                </div>


                <div className="button-createConv-container">
                    <ButtonCreateConv type="submit" >Join Conversation</ButtonCreateConv>
                </div>
            </form>
        </>
    );
};

import { useState, useEffect } from "react";
import { ButtonCreateConv, InputContainer, InputField, ButtonAddUser, InputLabel } from '../../utils/styles';
import '../conversations/GlobalConversations.css'
import axios from 'axios';
import { BlockUserModal } from "../modals/BlockUserModal";
const server_adress = process.env.REACT_APP_SERVER_ADRESS;

interface ConvDataInput {
    userName: string;
}

type BlockUserFormProps = {
    setShowModal: (show: boolean) => void;
};

export const BlockUserForm: React.FC<BlockUserFormProps> = ({ setShowModal }) => {

    const [showCheckPasswordModal, setShowCheckPasswordModal] = useState(false);
    const [convId, setConversationId] = useState<number | null>(null);

    const [ConvDataInput, setConvDataInput] = useState<ConvDataInput>({
        userName: '',
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

    const handleBlockUser = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<ConvDataInput> = {};
        if (!ConvDataInput.userName) {
            newErrors.userName = 'Username or email is required';
        }
        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
        }
        else {
            try {
                const response = await axios.post(`http://${server_adress}:3001/conversations/block_user`, ConvDataInput, {
                    withCredentials: true
                });
                console.log({ "RESPONSE from BLOCKING USER": response });
                if (response.status === 403) {
                    const customWarning = response.data.message;
                    alert(`Warning: ${customWarning}`);
                }
                setShowModal(false);
            } catch (error) {
                console.error('Blocking User error:', error);
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
            {showCheckPasswordModal && convId !== null && (<BlockUserModal
                setShowModal={() => {
                    setShowModal(false);
                }} />)}
            <form className="form-Create-Conversation" onSubmit={handleBlockUser}>
                <h2>Block Specific User</h2>

                <div className="input-createConv-container">
                    <InputContainer>
                        <InputLabel htmlFor="Conversation Name">
                            Username or email
                            <InputField
                                type="text" name="userName" value={ConvDataInput.userName} onChange={handleInputChange} />
                            {formErrors.userName && <div className="error-message">{formErrors.userName}</div>}
                        </InputLabel>
                    </InputContainer>
                </div>


                <div className="button-createConv-container">
                    <ButtonCreateConv type="submit" >Block User</ButtonCreateConv>
                </div>

            </form>
        </>
    );
};
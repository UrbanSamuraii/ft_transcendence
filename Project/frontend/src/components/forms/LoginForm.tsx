import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './GlobalForms.css';
import { useSocket } from './../../SocketContext';
// import './LoginForm.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';

interface FormData {
    email: string;
    password: string;
}

export const LoginForm = () => {

    const { socket } = useSocket();  // Get the socket from context

    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setFormErrors((prevErrors) => ({
            ...prevErrors,
            [name]: '',
        }));
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<FormData> = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        if (Object.keys(newErrors).length > 0) {
            setFormErrors(newErrors);
        }
        else {
            try {
                const response = await axios.post('http://localhost:3001/auth/login', { email: formData.email, password: formData.password }, {
                    withCredentials: true,
                });
                if (response.status == 200) {
                    if (socket) {
                        socket.disconnect()
                    }
                    navigate('/');
                }
                else {
                    console.log({ "User using 2FA authentication": response.data.user.email });
                    navigate(`/FortyTwoFA?userEmail=${response.data.user.email}`)
                }
            } catch (error) {
                console.error('Sign in request error:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response && error.response.data) {
                        const customError = error.response.data.error;
                        if (customError) {
                            alert(`Error: ${customError}`);
                        }
                    }
                }
            }
        }
    };

    // const EmailIcon = () => (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
    //       <path d="M0 3.5a1.5 1.5 0 0 1 1 1.5v8a1.5 1.5 0 0 1-3 0v-8a1.5 1.5 0 0 1 1-1.5z"/>
    //       <path d="M14 5l-7 4.5L0 5v8h14V5zM1 6.493l6 3.822 6-3.822V13H1V6.493z"/>
    //     </svg>
    //   );

    //   const LockIcon = () => (
    //     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock" viewBox="0 0 16 16">
    //       <path d="M4 1a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V1zm1 5h6V2H5v4zm0 6V7h6v5H5z"/>
    //     </svg>
    //   );

    return (
        <form className="form-container" onSubmit={handleSignIn}>

            <div className="input-login-container">
                <InputContainer>
                    <InputLabel htmlFor="email">
                        {/* <EmailIcon/> */}
                        Email
                        <InputField
                            type="email" name="email" value={formData.email} onChange={handleInputChange} />
                        {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                    </InputLabel>
                </InputContainer>
            </div>

            <div className="input-login-container">
                <InputContainer>
                    <InputLabel htmlFor="password">
                        {/* <LockIcon/> */}
                        Password
                        <InputField
                            type="password" name="password" value={formData.password} onChange={handleInputChange} />
                        {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                    </InputLabel>
                </InputContainer>
            </div>

            <div className="button-login-container">
                <Button type="submit" >Login</Button>
            </div>

            <div className="existingUserOrNot">
                <span>Don't have an account? </span>
                <Link to="/signup">Register</Link>
            </div>

        </form>
    );
};

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './GlobalForms.css';
import { useSocket } from './../../SocketContext';
import DOMPurify from 'dompurify';

const server_adress = process.env.REACT_APP_SERVER_ADRESS;

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
        
        let maxCharacterLimit;
        switch (name) {
            case 'email':
                maxCharacterLimit = 30;
                break;
            default:
                maxCharacterLimit = 15;
        }
        if (value.length > maxCharacterLimit) { return; }
        
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
                const sanitizedFormData = {
                    ...formData,
                    email: DOMPurify.sanitize(formData.email),
                    password: DOMPurify.sanitize(formData.password),
                };
                const response = await axios.post(`http://${server_adress}:3001/auth/login`, { email: sanitizedFormData.email, password: sanitizedFormData.password }, {
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

    return (
        <div className="app-container">
            <head>
                <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'></link>
            </head>

            <body className='some-class'>
                <div className='animation-box'>
                    <span className='borderline-login'></span>
                    <form className="form-container" onSubmit={handleSignIn}>
                        <h1 className='zagolovok'>Login</h1>
                        <div className="input-login-container">
                            <InputContainer>
                                <InputField className='input'
                                    placeholder="email" type="email" name="email" value={formData.email} onChange={handleInputChange} maxLength={30}/>
                                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                                <i className='bx bx-user'></i>
                            </InputContainer>
                        </div>

                        <div className="input-login-container">
                            <InputContainer>
                                <InputField
                                    placeholder="password" type="password" name="password" value={formData.password} onChange={handleInputChange} maxLength={15}/>
                                {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                                <i className='bx bxs-lock-alt'></i>
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
                </div>
            </body>
        </div>
    );
};

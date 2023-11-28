import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './GlobalForms.css';
import { useSocket } from './../../SocketContext';


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
                // console.log("DATA: ", formData);
                const response = await axios.post('http://localhost:3001/auth/login', { email: formData.email, password: formData.password }, {
                    withCredentials: true,
                });
                if (response.status == 200) {
                    console.log("before ON AUTH");
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
        <form className="form-container" onSubmit={handleSignIn}>

            <div className="input-login-container">
                <InputContainer>
                    <InputLabel htmlFor="email">
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

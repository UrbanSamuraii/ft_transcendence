import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button, Button42, InputContainer, InputField, InputLabel } from '../../utils/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GlobalForms.css';
import { useSocket } from './../../SocketContext';

interface FormData {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
}

export const RegisterForm = () => {

    const navigate = useNavigate();
    const { socket } = useSocket();  // Get the socket from context

    const [formData, setFormData] = useState<FormData>({
        email: '',
        username: '',
        first_name: '',
        last_name: '',
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

    async function handleSignUp42Click() {
        try {
            window.location.href = 'http://localhost:3001/auth/signup42';
        }
        catch (error) {
            console.error('Sign up request error:', error);
        }
    }

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Partial<FormData> = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        }
        if (!formData.username) {
            newErrors.username = 'Username is required';
        }
        if (/[.,;!?'"<>]|\s/.test(formData.username)) {
            newErrors.username = 'Username cannot contain spaces or punctuation marks';
        }
        if (!formData.first_name) {
            newErrors.first_name = 'First name is required';
        }
        if (/[.,;!?'"<>]|\s/.test(formData.first_name)) {
            newErrors.first_name = 'First name cannot contain spaces or punctuation marks';
        }
        if (!formData.last_name) {
            newErrors.last_name = 'Last name is required';
        }
        if (/[.,;!?'"<>]/.test(formData.last_name)) {
            newErrors.last_name = 'Last name cannot contain spaces or punctuation marks';
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
                const response = await axios.post('http://localhost:3001/auth/signup', formData, {
                    withCredentials: true,
                });
                // console.log(response.status, response.data.token);
                if (socket) {
                    socket.disconnect()
                }
                navigate('/play');
            } catch (error) {
                console.error('Sign up request error:', error);
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
        <form className="form-container" onSubmit={handleSignUp}>
            <section className="nameFieldRow">
                <InputContainer>
                    <InputLabel htmlFor="email">Email</InputLabel>
                    <InputField
                        type="email" name="email" value={formData.email} onChange={handleInputChange} />
                    {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                </InputContainer>
            </section>

            <section className="nameFieldRow">
                <div className="nameFieldContainerFirst">
                    <InputContainer>
                        <InputLabel htmlFor="first_name">First Name</InputLabel>
                        <InputField
                            type="text" name="first_name" value={formData.first_name} onChange={handleInputChange}
                        />
                        {formErrors.first_name && <div className="error-message">{formErrors.first_name}</div>}
                    </InputContainer>
                </div>
                <div className="nameFieldContainerLast">
                    <InputContainer>
                        <InputLabel htmlFor="last_name">Last Name</InputLabel>
                        <InputField
                            type="text" name="last_name" value={formData.last_name} onChange={handleInputChange}
                        />
                        {formErrors.last_name && <div className="error-message">{formErrors.last_name}</div>}
                    </InputContainer>
                </div>
            </section>

            <section className="nameFieldRow">
                <div className="nameFieldContainerFirst">
                    <InputContainer>
                        <InputLabel htmlFor="username">Username</InputLabel>
                        <InputField
                            type="text" name="username" value={formData.username} onChange={handleInputChange}
                        />
                        {formErrors.username && <div className="error-message">{formErrors.username}</div>}
                    </InputContainer>
                </div>
                <div className="nameFieldContainerLast">
                    <InputContainer>
                        <InputLabel htmlFor="password">Password</InputLabel>
                        <InputField
                            type="password" name="password" value={formData.password} onChange={handleInputChange} />
                        {formErrors.password && <div className="error-message">{formErrors.password}</div>}
                    </InputContainer>
                </div>
            </section>

            <section className="nameFieldRow">
                <Button type="submit" >Create My Account</Button>
            </section>

            <div className="existingUserOrNot">
                <span>Already have an account? </span>
                <Link to="/Login">Login</Link>
            </div>

            <Button42 className="button42" onClick={handleSignUp42Click}>42 Identification</Button42>
        </form>
    );
};

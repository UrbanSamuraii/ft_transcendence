import { Button, InputContainer, InputField, InputLabel } from '../../utils/styles';
// import styled, { css } from 'styled-components';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RegisterForm.css';

export const LoginForm = () => {

	const onSubmit = (event:React.ChangeEvent<HTMLInputElement>) => {
		event.preventDefault();
	};

	return (
		<div className="form-container">
			<InputContainer>
				<InputLabel htmlFor="email">Email</InputLabel>
				<InputField type="email" id="email"/>
			</InputContainer>

			<InputContainer>
					<InputLabel htmlFor="password">Password</InputLabel>
					<InputField type="password" id="password"/>
				</InputContainer>
			
			<Button>Login</Button>

			<div className="existingUserOrNot">
				<span>Don't have an account ? </span>
				<Link to='http://localhost:3000/AuthenticationPage'>
					<span>Register</span>
				</Link>
			</div>
		</div>
	);
  };
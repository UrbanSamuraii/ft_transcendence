import { Button, InputContainer, InputField, InputLabel } from '../../utils/styles';
// import styled, { css } from 'styled-components';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import './RegisterForm.css';

export const LoginForm = () => {

	const {register, handleSubmit, formState: {errors}} = useForm();

	const onSubmit = (data:any) => {
		console.log(data);
	};

	return (
		<div className="form-container" onSubmit={handleSubmit(onSubmit)}>
			<InputContainer>
				<InputLabel htmlFor="email" {...register('email', {
					required: 'Email is required',
					})}>Email</InputLabel>
				<InputField type="email" id="email"/>
			</InputContainer>

			<InputContainer>
					<InputLabel htmlFor="password" {...register('password', {
					required: 'Password is required',
					})}>Password</InputLabel>
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
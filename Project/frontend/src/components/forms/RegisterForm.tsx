import { Button, InputContainer, InputField, InputLabel, Button42 } from '../../utils/styles';
// import styled, { css } from 'styled-components';
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Link } from 'react-router-dom';
import './RegisterForm.css';

export const RegisterForm = () => {

	const {register, handleSubmit, formState: {errors}} = useForm();
	
	const onSubmit = (data:any) => {
		console.log(data);
	};

	// const onSubmit = (event:React.ChangeEvent<HTMLInputElement>) => {
	// 	event.preventDefault();
	// };

	return (
		<div className="form-container" onSubmit={handleSubmit(onSubmit)}>
			<InputContainer>
				<InputLabel htmlFor="email" {...register('email', {
					required: 'Email is required',
					})}>Email</InputLabel>
				<InputField type="email" id="email"/>
			</InputContainer>
			<section className="nameFieldRow">
				<div className="nameFieldContainerFirst">
				<InputContainer>
					<InputLabel htmlFor="firstName" {...register('firstName', {
					required: 'First name is required',
					})}>First Name</InputLabel>
					<InputField type="text" id="firstName"/>
				</InputContainer>
				</div>
				<div className="nameFieldContainerLast">
				<InputContainer>
					<InputLabel htmlFor="lastName" {...register('lastName', {
					required: 'Last name is required',
					})}>Last Name</InputLabel>
					<InputField type="text" id="lastName"/>
				</InputContainer>
				</div>
			</section>
			<section className="nameFieldRow">
				<div className="nameFieldContainerFirst">
				<InputContainer>
					<InputLabel htmlFor="userName" {...register('userName', {
					required: 'Username is required',
					})}>Username</InputLabel>
					<InputField type="text" id="userName"/>
				</InputContainer>
				</div>
				<div className="nameFieldContainerLast">
				<InputContainer>
					<InputLabel htmlFor="password" {...register('password', {
					required: 'Password is required',
					})}>Password</InputLabel>
					<InputField type="password" id="password"/>
				</InputContainer>
				</div>
			</section>
			<Button>Create My Account</Button>
			<div className="existingUserOrNot">
				<span>Already have an account ? </span>
				<Link to='http://localhost:3000/LoginPage'>
					<span>Login</span>
				</Link>
			</div>
			<Button42 className="button42">42 Identification</Button42>
			<div className="existingUserOrNot"></div>
		</div>
	);
  };
import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button, Button42, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './RegisterForm.css';

export const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  console.log(errors); 
  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
      <InputContainer>
        <InputLabel htmlFor="email">Email</InputLabel>
        <InputField
          type="email"
          id="email"
          {...register('email', { required: 'Email is required' })}
        />
      </InputContainer>

      <section className="nameFieldRow">
        <div className="nameFieldContainerFirst">
          <InputContainer>
            <InputLabel htmlFor="firstName">First Name</InputLabel>
            <InputField
              type="text"
              id="firstName"
              {...register('firstName', { required: 'First name is required' })}
            />
          </InputContainer>
        </div>
        <div className="nameFieldContainerLast">
          <InputContainer>
            <InputLabel htmlFor="lastName">Last Name</InputLabel>
            <InputField
              type="text"
              id="lastName"
              {...register('lastName', { required: 'Last name is required' })}
            />
          </InputContainer>
        </div>
      </section>

      <section className="nameFieldRow">
        <div className="nameFieldContainerFirst">
          <InputContainer>
            <InputLabel htmlFor="userName">Username</InputLabel>
            <InputField
              type="text"
              id="userName"
              {...register('userName', { required: 'Username is required' })}
            />
          </InputContainer>
        </div>
        <div className="nameFieldContainerLast">
          <InputContainer>
            <InputLabel htmlFor="password">Password</InputLabel>
            <InputField
              type="password"
              id="password"
              {...register('password', { required: 'Password is required' })}
            />
          </InputContainer>
        </div>
      </section>

      <Button>Create My Account</Button>

      <div className="existingUserOrNot">
        <span>Already have an account? </span>
        <Link to="/LoginPage">Login</Link>
      </div>

      <Button42 className="button42">42 Identification</Button42>
      <div className="existingUserOrNot"></div>
    </form>
  );
};

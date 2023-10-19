import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button, InputContainer, InputField, InputLabel } from '../../utils/styles';
import './GlobalForms.css';

export const LoginForm = () => {
  const { register, handleSubmit, formState: {errors} } = useForm();

  
  console.log(errors);
  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit(onSubmit)}>
      <InputContainer>
        <InputLabel htmlFor="email">
          Email
          <InputField
            type="email"
            id="email"
            {...register('email', {
              required: 'Email is required',
            })}
          />
        </InputLabel>
      </InputContainer>

      <InputContainer>
        <InputLabel htmlFor="password">
          Password
          <InputField
            type="password"
            id="password"
            {...register('password', {
              required: 'Password is required',
            })}
          />
        </InputLabel>
      </InputContainer>

      <Button>Login</Button>

      <div className="existingUserOrNot">
        <span>Don't have an account? </span>
        <Link to="/AuthenticationPage">Register</Link>
      </div>
    </form>
  );
};

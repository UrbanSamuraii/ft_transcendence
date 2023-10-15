import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  email: string;
  password: string;
  two_factor_athentication_password: string; // Optional 2FA password field
}

function SigninForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    two_factor_athentication_password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // const response = await axios.post('http://localhost:3001/auth/login', formData, {
      //   withCredentials: true,
      // });
      const response = await axios.post('http://localhost:3001/auth/login', { email: formData.email, password:formData.password }, {
        withCredentials: true,
      });
      console.log({"SIGNIN response.data.bool": response.data.bool});
      if (response.data.bool === true) {
        // setFormData({ ...formData, two_factor_athentication_password: '' });
        try {
          const response = await axios.post('http://localhost:3001/auth/2fa/login', formData, {
          withCredentials: true,
          });
          navigate('/play'); 
        }
        catch (error) {
          console.error('Sign in 2FA request error:', error);
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
      else {
        navigate('/play'); 
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </label>
      <label>
        Password:
        <input type="password" name="password" value={formData.password} onChange={handleChange} />
      </label>
      <label>
        2faAuthentication Password:
        <input type="password" name="two_factor_athentication_password" value={formData.two_factor_athentication_password} onChange={handleChange} />
      </label>
      <button type="submit">Sign In</button>
    </form>
  );
}

export default SigninForm;

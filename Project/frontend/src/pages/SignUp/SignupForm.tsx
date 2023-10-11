import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
}

function SignupForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/auth/signup', formData, {
        withCredentials: true,
      });
      console.log(response.status, response.data.token);
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
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Email:
        <input type="email" name="email" value={formData.email} onChange={handleChange} />
      </label>
      <label>
        Username:
        <input type="text" name="username" value={formData.username} onChange={handleChange} />
      </label>
      <label>
        First Name:
        <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
      </label>
      <label>
        Last Name:
        <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
      </label>
      <label>
        Password:
        <input type="password" name="password" value={formData.password} onChange={handleChange} />
      </label>
      <button type="submit">Sign Up</button>
    </form>
  );
}

export default SignupForm;

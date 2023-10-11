import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
  email: string;
  password: string;
}

function SigninForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/auth/signin', formData);
      console.log('Registration successful:', response.data);
      navigate('/play');
    } catch (error) {
      console.error('Sign up request error:', error);
      if (axios.isAxiosError(error)) {
        // Check for custom error messages
        const customError = error.response?.data.error;
        if (customError) {
          // Display the custom error message to the user
          alert(`Error: ${customError}`);
        }
      }
      navigate('/');
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
      <button type="submit">Sign In</button>
    </form>
  );
}

export default SigninForm;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SigninForm() {

	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	async function handleSubmit(e) {
		e.preventDefault();
		try {
			const response = await axios.post('http://localhost:3001/auth/login', formData);
			console.log('Registration successful:', response.data);
			navigate('/play');
		} catch (error) {
			console.error('Sign up request error:', error);
			if (error.response && error.response.data) {
				// Check for custom error messages
				const customError = error.response.data.error;
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
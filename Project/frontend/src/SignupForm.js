import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignupForm() {

	const navigate = useNavigate();
	// const history = useHistory();

	const [formData, setFormData] = useState({
		email: '',
		username: '',
		first_name: '',
		last_name: '',
		password: '',
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	async function handleSubmit(e) {
		e.preventDefault();
		try {
			const response = await axios.post('http://localhost:3001/auth/signup', formData);
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
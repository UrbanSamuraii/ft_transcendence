import React, { useState } from 'react';
import axios from 'axios';

function SignupForm() {
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

const handleSubmit = async (e) => {
	e.preventDefault();
	try {
	const response = await axios.post('http://localhost:3001/auth/signup', formData);
	console.log('Registration successful:', response.data);
	} catch (error) {
	console.error('Sign up request error:', error);
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
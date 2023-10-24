import React, { useState, useEffect } from 'react';
import { Button2FA, Button42, InputContainer, InputField, InputLabel, Text2FA } from '../../utils/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GlobalForms.css';

export const TwoFAEnablingForm = () => {

const navigate = useNavigate();

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetupClick = async () => {
	try {
		console.log("LETS SET UP 2FA");
      	const response = await axios.post('http://localhost:3001/auth/2fa/generate', null, {
        withCredentials: true,
      });
      const updatedUser = response.data.user; 
      const qrCodeUrl  = response.data.qrCodeUrl;
      if (updatedUser) {
        setQrCodeUrl(qrCodeUrl);
      } else { console.error('User not updated in response.'); }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
    } 
  }

  const handleEnableClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/auth/2fa/turn_on', { twoFactorAuthenticationCode: authenticationCode }, {
        withCredentials: true,
      });
      console.log({"RESPONSE FROM ENABLING 2FA": response});
      navigate('/play');
    }
    catch (error) {
      console.error('Error enabling up 2FA:', error);
    } 
}
  
return (
    <form className="TwoFA-form-container">
      <div className="TwoFA-content-container">
        <Text2FA>Two-Factor Authentication Setup</Text2FA>
		{error && <div className="error-message">{error}</div>}
		{!qrCodeUrl && ( 
			<Button2FA type="button" onClick={handleSetupClick}>Start 2FA Setup</Button2FA>
		)}
		{qrCodeUrl && (
			<div className="TwoFA-content-container-QR">
				<img src={qrCodeUrl} alt="QR Code" />
				<input
				type="text"
				placeholder="Authentication Code"
				value={authenticationCode}
				onChange={(e) => setAuthenticationCode(e.target.value)}/>
        	</div>
        )}
		<Button2FA type="button" onClick={handleEnableClick}>Enable 2FA</Button2FA>
      </div>
    </form>
  );
};
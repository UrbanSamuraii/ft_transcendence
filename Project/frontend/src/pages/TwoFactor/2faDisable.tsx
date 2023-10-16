import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TwoFactorDisable() {
  const navigate = useNavigate();

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [authenticationCode, setAuthenticationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDisableClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/auth/2fa/turn_off', null, {
        withCredentials: true,
      });
      console.log({"RESPONSE FROM DISABLING 2FA": response});
      navigate('/play');
    }
    catch (error) {
      console.error('Error disabling up 2FA:', error);
    } 
}
  
  return (
    <div>
      <h2>Please confirm that you want your Two-Factor Authentication Setup disabled</h2>
    	<button onClick={handleDisableClick}>Disable 2FA</button>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
    </div>
  );
}

export default TwoFactorDisable;

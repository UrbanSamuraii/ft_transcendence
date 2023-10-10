import React, { useState } from 'react';
import axios from 'axios';

function TwoFactorSetup() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [authenticationCode, setAuthenticationCode] = useState('');

  const handleSetupClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/auth/2fa/generate', null, { withCredentials: true });
      console.log({"RESPONSE": response});
      const { updatedUser, qrCodeUrl } = response.data;
      if (updatedUser) {
        setQrCodeUrl(qrCodeUrl);
      } else {
        console.error('User not updated in response.');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
    }
  };

  const handleEnableClick = async () => {
    try {
      axios.post('http://localhost:3001/auth/2fa/turn-on', { twoFactorAuthenticationCode: authenticationCode }, { withCredentials: true }).then((response) => {
      console.log(response.status, response.data);
      navigate('/play');
    });
    } catch (error) {
      console.error('Error enabling 2FA:', error);
    }
  };

  return (
    <div>
      <h2>Two-Factor Authentication Setup</h2>
      {!qrCodeUrl && (
        <button onClick={handleSetupClick}>Start 2FA Setup</button>
      )}
      {qrCodeUrl && (
        <div>
          <img src={qrCodeUrl} alt="QR Code" />
          <input
            type="text"
            placeholder="Authentication Code"
            value={authenticationCode}
            onChange={(e) => setAuthenticationCode(e.target.value)}
          />
          <button onClick={handleEnableClick}>Enable 2FA</button>
        </div>
      )}
    </div>
  );
}

export default TwoFactorSetup;

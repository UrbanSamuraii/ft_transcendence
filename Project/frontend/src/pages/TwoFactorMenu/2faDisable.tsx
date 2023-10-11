import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TwoFactorDisable() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleDisableClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/auth/2fa/disable', null, {
        withCredentials: true
      });

      console.log(response.status, response.data);
      navigate('/play');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setError('Error disabling 2FA. Please try again.');
    }
  };
  return (
    <div>
      <h2>Disable Two-Factor Authentication</h2>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
      <div>
        <button onClick={handleDisableClick}>Disable 2FA</button>
      </div>
    </div>
  );
}

export default TwoFactorDisable;


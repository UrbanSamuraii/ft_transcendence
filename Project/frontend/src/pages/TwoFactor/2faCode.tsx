import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function TwoFactorCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const [TwoFACode, setAuthenticationCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState({ email: '' });
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const userEmail = searchParams.get('userEmail');
    if (userEmail) {
      setUser({ email: userEmail });
    }
  	}, [location.search]);

  const handleLogin42FAClick = async () => {
    try {
      const response = await axios.post('http://localhost:3001/auth/2fa/login', { two_factor_athentication_password: TwoFACode, email: user.email }, {
        withCredentials: true,
      });
      navigate('/play');
    }
    catch (error) {
      console.error('Error disabling up 2FA:', error);
    } 
}
  
  return (
    <div>
      <h2>Please enter you  Two-Factor Authentication code</h2>
	  	<input
            type="text"
            placeholder="Authentication Code"
            value={TwoFACode}
            onChange={(e) => setAuthenticationCode(e.target.value)}
        />
    	<button onClick={handleLogin42FAClick}>Login</button>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
    </div>
  );
}

export default TwoFactorCode;

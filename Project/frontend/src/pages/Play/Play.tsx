import React from 'react';
import TwoFactorMenu from '../TwoFactorMenu/TwoFactorMenu'; // Import the TwoFactorMenu component
import TwoFactorEnable from '../TwoFactorMenu/2faEnable'; // Import the TwoFactorEnable component
import TwoFactorDisable from '../TwoFactorMenu/2faDisable'; // Import the TwoFactorDisable component

interface PlayProps {
    onPlayClick: () => void;
    onSignOutClick: () => void;
    handleSetup2FA: () => void;
    handleDisable2FA: () => void;
}

const Play: React.FC<PlayProps> = ({ onPlayClick, onSignOutClick, handleSetup2FA, handleDisable2FA }) => {
    return (
        <div>
            <button className="play-button" onClick={onPlayClick}>PLAY</button>
            <button className="signout-button" onClick={onSignOutClick}>SIGN OUT</button>
            <button className="setup-2fa-button" onClick={handleSetup2FA}>Set up 2FA</button>
            <button className="disable-2fa-button" onClick={handleDisable2FA}>Disable 2FA</button> 
        </div>
    );
}

export default Play;


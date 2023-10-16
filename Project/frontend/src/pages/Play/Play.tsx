import React from 'react';
import TwoFactorEnable from '../TwoFactor/2faEnable' 

interface PlayProps {
    onPlayClick: () => void;
    onSignOutClick: () => void;
    onTurnOn2FA: () => void;
    onTurnOff2FA: () => void;
}

const Play: React.FC<PlayProps> = ({ onPlayClick, onSignOutClick, onTurnOn2FA, onTurnOff2FA}) => {
    return (
        <div>
            <button className="play-button" onClick={onPlayClick}>PLAY</button>
            <button className="signout-button" onClick={onSignOutClick}>SIGN OUT</button>
            <button className="turn-on-2fa-button" onClick={onTurnOn2FA}>Turn On 2FA authentication</button>
            <button className="disable-2fa-button" onClick={onTurnOff2FA}>Disable 2FA</button> 
        </div>
    );
}

export default Play;


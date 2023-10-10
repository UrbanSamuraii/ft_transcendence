import React from 'react';

interface PlayProps {
    onPlayClick: () => void;
    onSignOutClick: () => void;
    handleSetup2FA: () => void;
}

const Play: React.FC<PlayProps> = ({ onPlayClick, onSignOutClick, handleSetup2FA }) => {
    return (
        <div>
            <button className="play-button" onClick={onPlayClick}>PLAY</button>
            <button className="signout-button" onClick={onSignOutClick}>SIGN OUT</button>
            <button className="setup-2fa-button" onClick={handleSetup2FA}>Set up 2FA</button>

        </div>
    );
}

export default Play;

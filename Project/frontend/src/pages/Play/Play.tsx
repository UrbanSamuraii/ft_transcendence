import React from 'react';

interface PlayProps {
    onPlayClick: () => void;
    onSignOutClick: () => void;
}

const Play: React.FC<PlayProps> = ({ onPlayClick, onSignOutClick }) => {
    return (
        <div>
            <button className="play-button" onClick={onPlayClick}>PLAY</button>
            <button className="signout-button" onClick={onSignOutClick}>SIGN OUT</button>
        </div>
    );
}

export default Play;

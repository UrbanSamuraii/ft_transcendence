import React from 'react';
import TwoFactorMenu from '../TwoFactorMenu/TwoFactorMenu'; // Import the TwoFactorMenu component
import TwoFactorEnable from '../TwoFactorMenu/2faEnable'; // Import the TwoFactorEnable component
import TwoFactorDisable from '../TwoFactorMenu/2faDisable'; // Import the TwoFactorDisable component

interface PlayProps {
  onPlayClick: () => void;
  onSignOutClick: () => void;
  onEnable2FA: () => void;
  onDisable2FA: () => void;
  isTwoFactorEnabled: boolean;
}

const Play: React.FC<PlayProps> = ({ onPlayClick, onSignOutClick, onEnable2FA, onDisable2FA, isTwoFactorEnabled }) => {
  return (
    <div>
      <button className="play-button" onClick={onPlayClick}>
        PLAY
      </button>
      <button className="signout-button" onClick={onSignOutClick}>
        SIGN OUT
      </button>
      {isTwoFactorEnabled ? (
        <TwoFactorMenu onEnableClick={onEnable2FA} onDisableClick={onDisable2FA} />
      ) : null}
      {isTwoFactorEnabled ? (
        <TwoFactorDisable /> // Render the TwoFactorDisable component when 2FA is enabled
      ) : (
        <TwoFactorEnable /> // Render the TwoFactorEnable component when 2FA is not enabled
      )}
    </div>
  );
}

export default Play;

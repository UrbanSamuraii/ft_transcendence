import React from 'react';
import './TwoFactorMenu.css';

interface TwoFactorMenuProps {
  onEnableClick: () => void;
  onDisableClick: () => void;
}

const TwoFactorMenu: React.FC<TwoFactorMenuProps> = ({ onEnableClick, onDisableClick }) => {
  return (
    <div className="two-factor-menu">
      <div className="menu-item" onClick={onEnableClick}>
        Enable 2FA
      </div>
      <div className="menu-item" onClick={onDisableClick}>
        Disable 2FA
      </div>
    </div>
  );
};

export default TwoFactorMenu;

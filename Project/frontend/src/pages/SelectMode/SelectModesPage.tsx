import React from 'react';

interface SelectModePageProps {
    startGame: () => void;
    // handleSignoutClick: () => void;
}

// const SelectModePage: React.FC<SelectModePageProps> = ({ startGame, handleSignoutClick }) => {
const SelectModePage: React.FC<SelectModePageProps> = ({ startGame }) => {
    return (
        <div className="mode-selection">
            <button className="mode-button classic-mode" onClick={startGame}>CLASSIC</button>
            <button className="mode-button start-button placeholder-1">PLACEHOLDER 1</button>
            <button className="mode-button start-button placeholder-2">PLACEHOLDER 2</button>
            {/* <button className="signout-button" onClick={handleSignoutClick}>SIGN OUT</button> */}
        </div>
    );
};

export default SelectModePage;

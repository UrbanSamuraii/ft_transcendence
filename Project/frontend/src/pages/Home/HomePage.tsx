import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/select-mode');
    };

    return (
        <div className="homepage">
            <button className="play-button" onClick={handlePlayClick}>Play</button>
        </div>
    );
};

export default HomePage;

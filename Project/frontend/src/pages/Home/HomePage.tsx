import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/select-mode'); // Make sure this path matches your route
    };

    return (
        <div className="homepage">
            {/* Other content */}
            <button className="play-button" onClick={handlePlayClick}>Play</button>
        </div>
    );
};

export default HomePage;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate('/select-mode');
    };

    return (
        <div className="homepage">
            <div className='content'>
            <button className="text" data-text='Play' onClick={handlePlayClick}>Play</button>
            </div>
        </div>
    );
};

export default HomePage;

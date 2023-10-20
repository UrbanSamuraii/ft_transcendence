import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matchmaking.css';

function Matchmaking() {
    const navigate = useNavigate();


    return (
        <div className="paddle-container">
            <div className="searching-text">Searching for a game...</div>
            <div className="paddle"></div>
            <div className="ball"></div>
            <div className="paddle"></div>
        </div>
    );
}

export default Matchmaking;
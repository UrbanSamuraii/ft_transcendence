import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
//import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, useHistory } from 'react-router-dom';
import './App.css';
import SquareGame from './SquareGame';
import axios from 'axios';
import SignupForm from './SignupForm';

const defaultBackgroundStyle = {
    background: 'linear-gradient(45deg, #f6494d, #F5BD02, #0001ff)',
};

const routeBackgroundStyles = {
    '/': { background: 'linear-gradient(45deg, #ff0000, #ff7700, #ff00cc)' },
    '/select-mode': { background: 'linear-gradient(45deg, #0000ff, #0099ff, #00ffff)' },
    '/game': { background: 'linear-gradient(45deg, #00ff00, #ccff00, #ffcc00)' },
};


function App() {
    const [backgroundStyle, setBackgroundStyle] = useState(defaultBackgroundStyle);

    return (
        <Router>
            <div className="App" style={backgroundStyle}>
                <Content setBackgroundStyle={setBackgroundStyle} />
            </div>
        </Router>
    );
}

function Content({ setBackgroundStyle }) {
    const location = useLocation();
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameKey, setGameKey] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        setBackgroundStyle(routeBackgroundStyles[location.pathname] || defaultBackgroundStyle);
    }, [location.pathname, setBackgroundStyle]);

    function handlePlayClick() {
        navigate("/select-mode");
    }

    function startGame() {
        setGameStarted(true);
        setGameOver(false);
        setGameKey(prevKey => prevKey + 1);
        navigate("/game");
    }

    function handleGameOver() {
        setGameOver(true);
    }

    function goBackToMainMenu() {
        setGameStarted(false);
        setGameOver(false);
        navigate("/");
    }

    async function handleSignUp42Click() {
        try { 
            window.location.href = 'http://localhost:3001/auth/signup42'; }
        catch (error) { 
            console.error('Sign up request error:', error); }
    };

    function handleSignUpClick() {
        navigate('/signup');
      }
      
    return (
        <Routes>
            <Route path="/" element={
                <div>
                    <button className="play-button black-shiny-button" onClick={handleSignUp42Click}>42 SIGNUP</button>
                    <button className="play-button" onClick={handleSignUpClick}>SIGNUP</button>
              </div>
            } />
            <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
            <Route path="/select-mode" element={
                <div className="mode-selection">
                    <button className="mode-button classic-mode" onClick={startGame}>CLASSIC</button>
                    <button className="mode-button start-button placeholder-1">PLACEHOLDER 1</button>
                    <button className="mode-button start-button placeholder-2">PLACEHOLDER 2</button>

                </div>
            } />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/play" element={
                <button className="play-button" onClick={handlePlayClick}>
                    PLAY
                </button>
            } />
        </Routes>
    );
}

export default App;

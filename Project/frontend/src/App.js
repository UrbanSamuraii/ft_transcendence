import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import SquareGame from './SquareGame';
import SignupForm from './SignupForm';
import SigninForm from './SigninForm';
import axios from 'axios';

// import CustomRedirectionFrom42Route from './RedirectionFrom42';

const defaultBackgroundStyle = {
    background: 'linear-gradient(45deg, #f6494d, #F5BD02, #0001ff)',
};

const routeBackgroundStyles = {
    '/': { background: 'linear-gradient(45deg, #ff0000, #ff7700, #ff00cc)' },
    '/select-mode': { background: 'linear-gradient(45deg, #0000ff, #0099ff, #00ffff)' },
    '/game': { background: 'linear-gradient(45deg, #00ff00, #ccff00, #ffcc00)' },
    '/add-user': { background: 'linear-gradient(45deg, #F5BD02, #f6494d, #0001ff)' }, // Added background style for add-user route
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
            // Set a session storage flag to identify users coming from signup42
            // sessionStorage.setItem('cameFromSignup42', 'true');
            window.location.href = 'http://localhost:3001/auth/signup42';
        } catch (error) {
            console.error('Sign up request error:', error);
        }
    }

    // Check if the user came from signup42
    // const cameFromSignup42 = sessionStorage.getItem('cameFromSignup42');

    function handleSignUpClick() {
        navigate('/signup');
    }

    function handleSignInClick() {
        navigate('/signin');
    }

    const handleSignoutClick = async () => {
        try {
            const response = await fetch('http://localhost:3001/auth/signout', {
                method: 'GET',
                credentials: 'include'});
            console.log('Lets get out successful:', response);
            navigate('/');
        } catch (error) {
            console.error('Signout failed:', error);
        }
    }

    return (
        <Routes>
        <Route
          path="/"
          element={
            <div>
              <div className="new-user-section">
                <h2>New User</h2>
                <button className="signup-button black-shiny-button" onClick={handleSignUp42Click} style={{ marginRight: '10px' }}>42 SIGNUP</button>
                <button className="signup-button" onClick={handleSignUpClick}> SIGNUP </button>
              </div>
              <div className="welcome-back-section">
                <h2>Welcome Back</h2>
                <button className="signin-button" onClick={handleSignInClick}> SIGNIN </button>
              </div>
            </div>
          }
        />
          <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
          <Route path="/select-mode" element={
              <div className="mode-selection">
                  <button className="mode-button classic-mode" onClick={startGame}>CLASSIC</button>
                  <button className="mode-button start-button placeholder-1">PLACEHOLDER 1</button>
                  <button className="mode-button start-button placeholder-2">PLACEHOLDER 2</button>
                  <button className="signout-button" onClick={handleSignoutClick}>SIGN OUT</button>
              </div>
          } />
          <Route path="/signup" element={<SignupForm />} />
          <Route path="/signin" element={<SigninForm />} />
          <Route path="/play" element={
            <div>
                <button className="play-button" onClick={handlePlayClick}>PLAY</button>
                <button className="signout-button" onClick={handleSignoutClick}>SIGN OUT</button>
            </div>
          } />
      </Routes>
    );
}

export default App;

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import SquareGame from './pages/Game/SquareGame';
import SignupForm from './pages/SignUp/SignupForm';
import TwoFactorSetup from './pages/2faAuthentication/2faForm';
import Play from './pages/Play/Play';
import SigninForm from './pages/SignIn/SigninForm';
import SelectModePage from './pages/SelectMode/SelectModesPage';
import HomePage from './pages/Home/HomePage';
import { CSSProperties } from 'react';
import axios from 'axios';

// import CustomRedirectionFrom42Route from './RedirectionFrom42';

const defaultBackgroundStyle = {
    background: 'linear-gradient(45deg, #f6494d, #F5BD02, #0001ff)',
};

interface ContentProps {
    setBackgroundStyle: React.Dispatch<React.SetStateAction<React.CSSProperties>>;
}

interface RouteBackgroundStyles {
    [key: string]: React.CSSProperties;
}

const routeBackgroundStyles: RouteBackgroundStyles = {
    '/': { background: 'linear-gradient(45deg, #ff0000, #ff7700, #ff00cc)' },
    '/select-mode': { background: 'linear-gradient(45deg, #0000ff, #0099ff, #00ffff)' },
    '/game': { background: 'linear-gradient(45deg, #00ff00, #ccff00, #ffcc00)' },
    '/add-user': { background: 'linear-gradient(45deg, #F5BD02, #f6494d, #0001ff)' },
};

function App() {
    // const [backgroundStyle, setBackgroundStyle] = useState(defaultBackgroundStyle);
    const [backgroundStyle, setBackgroundStyle] = useState<CSSProperties>(defaultBackgroundStyle);

    return (
        <Router>
            <div className="App" style={backgroundStyle}>
                <Content setBackgroundStyle={setBackgroundStyle} />
            </div>
        </Router>
    );
}

// function Content({ setBackgroundStyle }) {
function Content({ setBackgroundStyle }: ContentProps) {
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

    const handleSetup2FA = () => {
        navigate('/2fa-setup');
    }

    const handleSignoutClick = async () => {
        try {
            interface ContentProps {
                setBackgroundStyle: React.Dispatch<React.SetStateAction<React.CSSProperties>>;
            }
            const response = await fetch('http://localhost:3001/auth/signout', {
                method: 'GET',
                credentials: 'include'
            });
            console.log('Lets get out successful:', response);
            navigate('/');
        } catch (error) {
            console.error('Signout failed:', error);
        }
    }

    return (
        <Routes>
            <Route path="/" element={<HomePage handleSignUp42Click={handleSignUp42Click} handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} />
            <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
            <Route path="/select-mode" element={<SelectModePage startGame={startGame} handleSignoutClick={handleSignoutClick} />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/signin" element={<SigninForm />} />
            <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} handleSetup2FA={handleSetup2FA} />} />
            <Route path="/2fa-setup" element={<TwoFactorSetup />} />
        </Routes>
    );
}

export default App;

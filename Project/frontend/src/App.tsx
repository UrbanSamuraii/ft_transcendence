import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import SquareGame from './pages/Game/SquareGame';
import SignupForm from './pages/SignUp/SignupForm';
import axios from 'axios';
import TwoFactorSetup from './pages/TwoFactor/2faEnable';
import Play from './pages/Play/Play';
import SigninForm from './pages/SignIn/SigninForm';
import SelectModePage from './pages/SelectMode/SelectModesPage';
import HomePage from './pages/Home/HomePage';
import { CSSProperties } from 'react';
import TwoFactorDisable from './pages/TwoFactor/2faDisable';
import TwoFactorCode from './pages/TwoFactor/2faCode';
import Matchmaking from './pages/Matchmaking/Matchmaking';
import { SocketProvider, useSocket } from './pages/Matchmaking/SocketContext';  // Update the path accordingly

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
    const [backgroundStyle, setBackgroundStyle] = useState<CSSProperties>(defaultBackgroundStyle);

    return (
        <Router>
            <div className="App" style={backgroundStyle}>
                <SocketProvider>
                    <Content
                        setBackgroundStyle={setBackgroundStyle}
                    />
                </SocketProvider>
            </div>
        </Router>
    );
}


function Content({ setBackgroundStyle }: ContentProps) {
    const location = useLocation();
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [gameKey, setGameKey] = useState(0);
    const navigate = useNavigate();
    const prevPathnameRef = useRef(location.pathname);
    const { stopSocketConnection } = useSocket();  // Get the socket from context

    useEffect(() => {
        setBackgroundStyle(routeBackgroundStyles[location.pathname] || defaultBackgroundStyle);
    }, [location.pathname, setBackgroundStyle]);

    useEffect(() => {
        const previousPathname = prevPathnameRef.current;

        console.log(previousPathname)
        console.log(location.pathname)
        if (previousPathname === "/game" && location.pathname !== "/game") {
            console.log("User left the game page!");
            // If you want to stop the socket connection, you can do so here:
            stopSocketConnection();
        }

        // Now update the ref after the check
        prevPathnameRef.current = location.pathname;
    }, [location.pathname]);


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
            window.location.href = 'http://localhost:3001/auth/signup42';
        }
        catch (error) {
            console.error('Sign up request error:', error);
        }
    }

    function handleSignUpClick() {
        navigate('/signup');
    }

    function handleSignInClick() {
        navigate('/login');
    }

    const TurnOn2FA = async () => {
        navigate('/2fa-enable')
    }

    const TurnOff2FA = async () => {
        navigate('/2fa-disable')
    }

    const handleSignoutClick = async () => {
        try {
            const response = await fetch('http://localhost:3001/auth/signout', {
                method: 'GET',
                credentials: 'include'
            });
            console.log('Signout successful:', response);
            navigate('/');
        } catch (error) {
            console.error('Signout failed:', error);
        }
    }

    useEffect(() => {
        console.log('Content component rendered');
    });

    return (
        <Routes>
            <Route path="/" element={<HomePage handleSignUp42Click={handleSignUp42Click} handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/2fa-enable" element={<TwoFactorSetup />} />
            <Route path="/2fa-disable" element={<TwoFactorDisable />} />
            <Route path="/login" element={<SigninForm />} />
            <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
            <Route path="/select-mode" element={<SelectModePage startGame={startGame} />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
            <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} onTurnOn2FA={TurnOn2FA} onTurnOff2FA={TurnOff2FA} />} />
            <Route path="/FortyTwoFA" element={<TwoFactorCode />} />
        </Routes>
    );
}

export default App;

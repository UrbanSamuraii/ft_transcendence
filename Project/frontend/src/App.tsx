import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation, Outlet } from 'react-router-dom';
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
import { AuthenticationPage } from './pages/AuthenticationPage';
import { LoginPage } from './pages/LoginPage';
import { ConversationPage } from './pages/ConversationPage';
import { ConversationChannelPage } from './pages/ConversationChannelPage';

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
    '/AuthenticationPage': { background: '#1a1a1a'},
    '/LoginPage': { background: '#1a1a1a'},
    '/ConversationPage': { background: '#1a1a1a'},
    '/ConversationChannelPage': { background: '#1a1a1a'},
};

function App() {
    const [backgroundStyle, setBackgroundStyle] = useState<CSSProperties>(defaultBackgroundStyle);

    return (
        <Router>
            <div className="App" style={backgroundStyle}>
                <Content
                    setBackgroundStyle={setBackgroundStyle}
                />
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
            navigate('/AuthenticationPage');
        } catch (error) {
            console.error('Signout failed:', error);
        }
    }

    const GoToConversations = async () => {
        navigate('/ConversationPage')
    }

    return (
        <Routes>
            <Route path="/" element={<HomePage handleSignUp42Click={handleSignUp42Click} handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} />
            {/* <Route path="/" element={<HomePage handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} /> */}
            <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
            <Route path="/select-mode" element={<SelectModePage startGame={startGame} />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/login" element={<SigninForm />} />
            <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} onTurnOn2FA={TurnOn2FA} onTurnOff2FA={TurnOff2FA} onConversations={GoToConversations}/>} />
            {/* <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} handleSetup2FA={handleSetup2FA} handleDisable2FA={handleDisable2FA} />} /> */}
            <Route path="/2fa-enable" element={<TwoFactorSetup />} />
            <Route path="/2fa-disable" element={<TwoFactorDisable />} />
            <Route path="/FortyTwoFA" element={<TwoFactorCode />} />
            <Route path="/AuthenticationPage" element={<AuthenticationPage />} />
            <Route path="/LoginPage" element={<LoginPage />} />
            <Route path="/ConversationPage" element=
            {<ConversationPage />}>
                <Route path="channel/:id" element=
                {<ConversationChannelPage />} />
            </Route>    
        </Routes>
    );
}

export default App;

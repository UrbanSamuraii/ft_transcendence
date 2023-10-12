import * as React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import SquareGame from './pages/Game/SquareGame';
import SignupForm from './pages/SignUp/SignupForm';
// import TwoFactorSetup from './pages/TwoFactorMenu/2faEnable';
// import TwoFactorDisable from './pages/2faAuthentication/2faDisable';
import Play from './pages/Play/Play';
import SigninForm from './pages/SignIn/SigninForm';
import SelectModePage from './pages/SelectMode/SelectModesPage';
import HomePage from './pages/Home/HomePage';
import { CSSProperties } from 'react';

const defaultBackgroundStyle = {
    background: 'linear-gradient(45deg, #f6494d, #F5BD02, #0001ff)',
};

interface ContentProps {
    setBackgroundStyle: React.Dispatch<React.SetStateAction<React.CSSProperties>>;
    isTwoFactorEnabled: boolean; 
    setIsTwoFactorEnabled: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false); // Add 2FA state

    return (
        <Router>
            <div className="App" style={backgroundStyle}>
                <Content
                    setBackgroundStyle={setBackgroundStyle}
                    isTwoFactorEnabled={isTwoFactorEnabled} // Pass 2FA state to Content component
                    setIsTwoFactorEnabled={setIsTwoFactorEnabled} // Pass 2FA state setter to Content component
                />
            </div>
        </Router>
    );
}

function Content({ setBackgroundStyle, isTwoFactorEnabled, setIsTwoFactorEnabled }: ContentProps) {
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

    // async function handleSignUp42Click() {
    //     try {
    //         window.location.href = 'http://localhost:3001/auth/signup42';
    //     } catch (error) {
    //         console.error('Sign up request error:', error);
    //     }
    // }

    function handleSignUpClick() {
        navigate('/signup');
    }

    function handleSignInClick() {
        navigate('/login');
    }

    // function handleEnable2FA() {
    //     setIsTwoFactorEnabled(true); // enable 2FA
    // }

    // function handleDisable2FA() {
    //     setIsTwoFactorEnabled(false); // disable 2FA
    // }

    // const handleDisable2FA = async () => {
    //     try {
    //         const response = await axios.post('http://localhost:3001/auth/2fa/disable', null, {
    //             withCredentials: true
    //         });
    //         console.log(response.status, response.data);
    //     } catch (error) {
    //         console.error('Error disabling 2FA:', error);
    //     }
    // };

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

    return (
        <Routes>
            {/* <Route path="/" element={<HomePage handleSignUp42Click={handleSignUp42Click} handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} /> */}
            <Route path="/" element={<HomePage handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} />
            <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
            {/* <Route path="/select-mode" element={<SelectModePage startGame={startGame} handleSignoutClick={handleSignoutClick} />} /> */}
            <Route path="/select-mode" element={<SelectModePage startGame={startGame} />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/login" element={<SigninForm />} />
            <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} />} />
            {/* <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} handleSetup2FA={handleSetup2FA} handleDisable2FA={handleDisable2FA} />} /> */}
            {/* <Route path="/2fa-setup" element={<TwoFactorSetup />} /> */}
        </Routes>
    );
}

export default App;

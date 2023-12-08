import * as React from 'react';
import { useState, useEffect, FC, useRef } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import './App.css';
import SquareGame from './pages/Game/SquareGame';
import Play from './pages/Play/Play';
import SelectModePage from './pages/SelectMode/SelectModesPage';
import HomePage from './pages/Home/HomePage';
import { CSSProperties } from 'react';
import { Signup } from './pages/Signup';
import Signout from './pages/Signout/Signout';
import { Login } from './pages/Login';
import { ConversationPage } from './pages/ConversationPage';
import { ConversationChannelPage } from './pages/ConversationChannelPage';
import { TwoFAEnablingPage } from './pages/TwoFAEnablingPage';
import { TwoFADisablingPage } from './pages/TwoFADisablingPage';
import { TwoFACodePage } from './pages/TwoFACodePage';
import Navbar from './components/Navbar/Navbar';
import Matchmaking from './pages/Matchmaking/Matchmaking';
import Profile from './pages/Profile/Profile';
import { AuthProvider, useAuth } from './AuthContext'; // Update the path accordingly
import axios from 'axios';
import { OnlySocketProvider, useSocket } from './SocketContext';

const defaultBackgroundStyle = {
    background: '#1a1a1a',
};

interface ContentProps {
    setBackgroundStyle: React.Dispatch<React.SetStateAction<React.CSSProperties>>;
}

interface RouteBackgroundStyles {
    [key: string]: React.CSSProperties;
}

const routeBackgroundStyles: RouteBackgroundStyles = {
    '/': {
        background: "url('/HomeBackgroundRetro2.png')", // Note the quotes around the URL
        // backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#1a1a1a',
    },
    '/select-mode': { background: '#1a1a1a' },
    '/game': { background: '#1a1a1a' },
    '/add-user': { background: '#1a1a1a)' },
    '/signup': { background: '#1a1a1a' },
    '/Login': { background: '#1a1a1a' },
    '/ConversationPage': { background: '#1a1a1a' },
    '/ConversationChannelPage': { background: '#1a1a1a' },
    '/TwoFAEnablingPage': { background: '#1a1a1a' },
    '/TwoFADisablingPage': { background: '#1a1a1a' },
    '/TwoFACodePage': { background: '#1a1a1a' },
};

function App() {
    const [backgroundStyle, setBackgroundStyle] = useState<CSSProperties>(defaultBackgroundStyle);

    return (
        <Router>
            <AuthProvider>
                <OnlySocketProvider>
                    <div className="App" style={backgroundStyle}>
                        <Navbar />
                        <Content
                            setBackgroundStyle={setBackgroundStyle}
                        />
                    </div>
                </OnlySocketProvider>
            </AuthProvider>
        </Router>
    );
}

function Content({ setBackgroundStyle }: ContentProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const prevPathnameRef = useRef(location.pathname);
    const { user } = useAuth();

    useEffect(() => {
        setBackgroundStyle(routeBackgroundStyles[location.pathname] || defaultBackgroundStyle);
    }, [location.pathname, setBackgroundStyle]);

    useEffect(() => {
        const previousPathname = prevPathnameRef.current;

        console.log(previousPathname)
        console.log(location.pathname)

        prevPathnameRef.current = location.pathname;
    }, [location.pathname, prevPathnameRef, navigate]);

    function handlePlayClick() {
        navigate("/select-mode");
    }

    const TurnOn2FA = async () => {
        navigate('/2fa-enable')
    }

    const TurnOff2FA = async () => {
        navigate('/2fa-disable')
    }

    const handleSignoutClick = async () => {
        try {
            navigate('/signout');
        } catch (error) {
            console.error('Signout failed:', error);
            navigate('/error');
        }
    }

    const GoToConversations = async () => {
        navigate('/ConversationPage')
    }

    function handleLoginClick() {
        navigate("/login");
      }
    
      function handleSignupClick() {
        navigate("/signup");
      }

    return (
        <Routes>
            {/* <Route path="/" element={
                <div className="App">
                <header className="App-header">
                <p>
                {
                    // !data ? "Loading..." : data
                }
                </p>
                <link rel="preconnect" href="https://fonts.gstatic.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet"/>
            <button className='glitch-button'>ULTIMATE PONG</button>
            <div className="button-container">
                <button className='log-button' data-text="LOG IN" onClick={handleLoginClick}>log in</button>
                <button className='log-button' data-text="SIGN UP" onClick={handleSignupClick}>sign up</button>
            </div>
            </header>
            </div>
            } /> */}
            {/* Public routes */}
            <Route path="/game/:id" element={<SquareGame />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ConversationPage" element={<ConversationPage />} >
                <Route path="channel/:id" element={<ConversationChannelPage />} />
            </Route>
            <Route path="/FortyTwoFA" element={<TwoFACodePage />} />
            <Route path="/" element={<HomePage />} />

            {/* Protected routes */}
            {user && (
                <>
                    <Route path="/select-mode" element={<SelectModePage />} />
                    <Route path="/play" element={<Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} onTurnOn2FA={TurnOn2FA} onTurnOff2FA={TurnOff2FA} onConversations={GoToConversations} />} />
                    <Route path="/2fa-enable" element={<TwoFAEnablingPage />} />
                    <Route path="/2fa-disable" element={<TwoFADisablingPage />} />
                    <Route path="/@/:username" element={<Profile />} />
                    <Route path="/matchmaking" element={<Matchmaking />} />
                    <Route path="/signout" element={<Signout />} />
                </>
            )}
        </Routes>
    );

}

export default App;

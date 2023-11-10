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
import { Login } from './pages/Login';
import { ConversationPage } from './pages/ConversationPage';
import { ConversationChannelPage } from './pages/ConversationChannelPage';
import { TwoFAEnablingPage } from './pages/TwoFAEnablingPage';
import { TwoFADisablingPage } from './pages/TwoFADisablingPage';
import { TwoFACodePage } from './pages/TwoFACodePage';
import { AuthenticatedRoute } from './components/routes/AuthenticatedRoutes'
import Navbar from './components/Navbar/Navbar';
import { SocketProvider, useSocket } from './pages/Matchmaking/SocketContext';  // Update the path accordingly
import Matchmaking from './pages/Matchmaking/Matchmaking';
import Profile from './pages/Profile/Profile';
import { ChatSocketProvider, useChatSocket } from './utils/context/chatSocketContext';
import { AuthProvider, useAuth } from './AuthContext'; // Update the path accordingly


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
                <div className="App" style={backgroundStyle}>
                    <Navbar />
                    <ChatSocketProvider>
                        <SocketProvider>
                            <Content
                                setBackgroundStyle={setBackgroundStyle}
                            />
                        </SocketProvider>
                    </ChatSocketProvider>
                </div>
            </AuthProvider>
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
    const { stopChatSocketConnection } = useChatSocket();
    const { user } = useAuth();

    useEffect(() => {
        setBackgroundStyle(routeBackgroundStyles[location.pathname] || defaultBackgroundStyle);
    }, [location.pathname, setBackgroundStyle]);

    useEffect(() => {
        const previousPathname = prevPathnameRef.current;

        console.log(previousPathname)
        console.log(location.pathname)
        if (previousPathname === "/game" && location.pathname === "/matchmaking") {
            console.log("User left the game page!");
            // If you want to stop the socket connection, you can do so here:
            stopSocketConnection();
            navigate("/play"); // Redirect to play page

        }
        else if (previousPathname === "/game" && location.pathname !== "/game") {
            console.log("User left the game page!");
            // If you want to stop the socket connection, you can do so here:
            stopSocketConnection();
        }
        else if (previousPathname === "/ConversationPage" && !location.pathname.startsWith("/ConversationPage")) {
            console.log("User left the conversation page!");
            stopChatSocketConnection();
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
            navigate('/signup');
        } catch (error) {
            console.error('Signout failed:', error);
        }
    }

    const GoToConversations = async () => {
        navigate('/ConversationPage')
    }
    useEffect(() => {
        console.log('Content component rendered');
    });

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage handleSignUp42Click={handleSignUp42Click} handleSignUpClick={handleSignUpClick} handleSignInClick={handleSignInClick} />} />
            <Route path="/game" element={<SquareGame key={gameKey} onStartGame={startGame} onGoBackToMainMenu={goBackToMainMenu} onGameOver={handleGameOver} />} />
            <Route path="/select-mode" element={<SelectModePage startGame={startGame} />} />
            <Route path="/play" element={<AuthenticatedRoute>
                <Play onPlayClick={handlePlayClick} onSignOutClick={handleSignoutClick} onTurnOn2FA={TurnOn2FA} onTurnOff2FA={TurnOff2FA} onConversations={GoToConversations} />
            </AuthenticatedRoute>} />
            <Route path="/2fa-enable" element={<AuthenticatedRoute><TwoFAEnablingPage /></AuthenticatedRoute>} />
            <Route path="/2fa-disable" element={<AuthenticatedRoute><TwoFADisablingPage /></AuthenticatedRoute>} />
            <Route path="/FortyTwoFA" element={<TwoFACodePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/ConversationPage" element={<AuthenticatedRoute><ConversationPage /></AuthenticatedRoute>} >
                <Route path="channel/:id" element=
                    {<AuthenticatedRoute><ConversationChannelPage /></AuthenticatedRoute>} />
            </Route>

            {/* Protected routes */}
            {user && (
                <>
                    <Route path="/@/:username" element={<Profile />} />
                    <Route path="/matchmaking" element={<Matchmaking />} />
                </>
            )}
        </Routes>
    );
}

export default App;

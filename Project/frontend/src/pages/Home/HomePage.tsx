import React from 'react';

interface HomePageProps {
    handleSignUp42Click: () => void;
    handleSignUpClick: () => void;
    handleSignInClick: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ handleSignUp42Click, handleSignUpClick, handleSignInClick }) => {
    return (
        <div>
            {/* <div className="new-user-section">
                <h2>New User</h2>
                <button className="signup-button black-shiny-button" onClick={handleSignUp42Click} style={{ marginRight: '10px' }}>
                    42 SIGNUP
                </button>
                <button className="signup-button" onClick={handleSignUpClick}>
                    SIGNUP
                </button>
            </div>
            <div className="welcome-back-section">
                <h2>Welcome Back</h2>
                <button className="login-button" onClick={handleSignInClick}>
                    SIGN IN
                </button>
            </div> */}
        </div>
    );
};

export default HomePage;

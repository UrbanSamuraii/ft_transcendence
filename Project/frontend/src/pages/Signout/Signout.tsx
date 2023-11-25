// SignoutPage.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext'; // Adjust the import path as needed

const SignoutPage = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        const signout = async () => {
            try {
                await fetch('http://localhost:3001/auth/signout', {
                    method: 'GET',
                    credentials: 'include'
                });

                // if (socket) {
                //     socket.disconnect();
                // }
                navigate('/');
            } catch (error) {
                console.error('Signout failed:', error);
                navigate('/error'); // Navigate to an error page if needed
            }
        };

        signout();
    }, []);

    return <div>Signing out...</div>;
};

export default SignoutPage;

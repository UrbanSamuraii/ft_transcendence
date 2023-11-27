import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';

const SignoutPage = () => {
    const navigate = useNavigate();
    const { socket, disconnectAndReconnect } = useSocket();

    useEffect(() => {
        const signout = async () => {
            try {
                await fetch('http://localhost:3001/auth/signout', {
                    method: 'GET',
                    credentials: 'include'
                });
                if (socket) {
                    console.log({"Sign out socket": socket.id});
                    disconnectAndReconnect();
                }
                navigate('/');
            } catch (error) {
                console.error('Signout failed:', error);
                navigate('/error');
            }
        };

        signout();
    }, [socket, disconnectAndReconnect]);

    return <div>Signing out...</div>;
};

export default SignoutPage;
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';
const server_adress = process.env.REACT_APP_SERVER_ADRESS;

const SignoutPage = () => {
    const navigate = useNavigate();
    const { socket } = useSocket();

    useEffect(() => {
        const signout = async () => {
            try {
                await fetch(`http://${server_adress}:3001/auth/signout`, {
                    method: 'GET',
                    credentials: 'include'
                });
                // if (socket && socket.id) {
                //     console.log({ "Sign out socket": socket.id });
                //     socket.disconnect();
                // }
                navigate('/');
            } catch (error) {
                console.error('Signout failed:', error);
                navigate('/error');
            }
        };

        signout();
    }, [socket]);

    return <div>Signing out...</div>;
};

export default SignoutPage;
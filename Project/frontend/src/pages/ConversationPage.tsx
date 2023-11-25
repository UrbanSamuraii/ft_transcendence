import { Outlet } from 'react-router-dom';
import { Page } from '../utils/styles';
import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
import { useParams } from 'react-router-dom';
import { ConversationPanel } from '../components/conversations/ConversationPannel';
import { useEffect, useState, useContext } from 'react';
import { getConversations } from '../utils/hooks/getConversations';
// import { useSocket } from "../utils/context/useSocket";
import { useSocket } from '../SocketContext';

export const ConversationPage = () => {

    const { id } = useParams();
    const [prismaConversations, setPrismaConversations] = useState<any[]>([]);
    // const socket = useContext(useSocket);
    const { socket, setNewMessageReceived, newMessageReceived } = useSocket();  // Get the socket from context

    //   useEffect(() => {
    //       const initializeSocket = async () => {
    //         await socket?.startChatSocketConnection();
    //       };

    //     initializeSocket();
    //     console.log({"socket": socket});

    //     return () => { };
    //   }, [socket?.chatSocket]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const prismaConversations = await getConversations();
                setPrismaConversations(prismaConversations);
                setNewMessageReceived(false);
                // console.log('Type of prismaConversations:', typeof prismaConversations);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();

    }, [socket, newMessageReceived]);

    useEffect(() => {
        socket?.on('onMessage', (payload: any) => {
            // console.log('Update de la page');
            setNewMessageReceived(true);
        });
        return () => {
            socket?.off('onMessage');
        };
    }, [socket, newMessageReceived]);

    return (
        <Page>
            <ConversationSidebar conversations={prismaConversations} />
            {!id && <ConversationPanel />}
            <Outlet />
        </Page>
    );
};

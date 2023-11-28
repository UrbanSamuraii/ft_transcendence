import { Outlet } from 'react-router-dom';
import { Page } from '../utils/styles';
import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
import { useParams } from 'react-router-dom';
import { ConversationPanel } from '../components/conversations/ConversationPannel';
import { useEffect, useState, useContext } from 'react';
import { getConversations } from '../utils/hooks/getConversations';
import { useSocket } from '../SocketContext';

export const ConversationPage = () => {

    const { id } = useParams();
    const [prismaConversations, setPrismaConversations] = useState<any[]>([]);
    const { socket, setNewMessageReceived, newMessageReceived, isLastMessageDeleted } = useSocket();  

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const prismaConversations = await getConversations();
                setPrismaConversations(prismaConversations);
                setNewMessageReceived(false);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();

    }, [socket, newMessageReceived, isLastMessageDeleted]);

    useEffect(() => {
        socket?.on('onMessage', (payload: any) => {
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

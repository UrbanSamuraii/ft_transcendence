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
    const { socket, isLastMessageDeleted } = useSocket();  
    const chatSocketContextData = useSocket();

    useEffect(() => {
        const fetchConversations = async () => {
            console.log("ConversationPage WORKING ON");
            try {
                const prismaConversations = await getConversations();
                console.log("Fetched Conversations: ", prismaConversations);
                setPrismaConversations(prismaConversations);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        fetchConversations();

        chatSocketContextData?.socket?.on('onMessage', fetchConversations);
        chatSocketContextData?.socket?.on('onJoinRoom', fetchConversations);
        chatSocketContextData?.socket?.on('onRemovedMember', fetchConversations);
        chatSocketContextData?.socket?.on('onBeingBlockedorBlocked', fetchConversations);
        return () => {
            chatSocketContextData?.socket?.off('onMessage', fetchConversations);
            chatSocketContextData?.socket?.off('onJoinRoom', fetchConversations);
            chatSocketContextData?.socket?.off('onRemovedMember', fetchConversations);
            chatSocketContextData?.socket?.off('onBeingBlockedorBlocked', fetchConversations);
        };
    }, [chatSocketContextData, isLastMessageDeleted]);

    return (
        <Page>
            <ConversationSidebar conversations={prismaConversations} />
            {!id && <ConversationPanel />}
            <Outlet />
        </Page>
    );
};

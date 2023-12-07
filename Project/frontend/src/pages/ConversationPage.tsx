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
    const chatSocketContextData = useSocket();

    useEffect(() => {
        const onMemberMoveHandler = async (payload: any) => {
            console.log("FETCHING PRISMA CONV AGAIN");
            try {
                const prismaConversations = await getConversations();
                setPrismaConversations(prismaConversations);
                setNewMessageReceived(false);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };
        socket?.on('onJoinRoom', onMemberMoveHandler);
        socket?.on('onRemovedMember', onMemberMoveHandler);
        return () => {
            socket?.off('onRemovedMember', onMemberMoveHandler);
            socket?.off('onRemovedMember', onMemberMoveHandler);
        };
    }, [socket, chatSocketContextData]);

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

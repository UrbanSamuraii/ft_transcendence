import { Outlet } from 'react-router-dom';
import { Page } from '../utils/styles';
import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
import { useParams } from 'react-router-dom';
import { ConversationPanel } from '../components/conversations/ConversationPannel';
import { useEffect, useState, useContext } from 'react';
import { getConversations } from '../utils/hooks/getConversations';
import { chatSocketContext } from "../utils/context/chatSocketContext";

export const ConversationPage = () => {
  
  const { id } = useParams();
  const [prismaConversations, setPrismaConversations] = useState<any[]>([]); 
	const chatSocketContextData = useContext(chatSocketContext);

  useEffect(() => {
    chatSocketContextData?.startChatSocketConnection();
    return () => { };
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // chatSocketContextData?.startChatSocketConnection();
        const prismaConversations = await getConversations();
        setPrismaConversations(prismaConversations); 
        chatSocketContextData?.setNewMessageReceived(false)
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();

  }, [chatSocketContextData?.newMessageReceived, chatSocketContextData]);

  useEffect(() => {
      chatSocketContextData?.chatSocket?.on('onMessage', (payload: any) => {
			console.log('Update de la page');
      chatSocketContextData?.setNewMessageReceived(true); 
		});
		return() => {
			chatSocketContextData?.chatSocket?.off('onMessage');
		};
	}, [chatSocketContextData?.chatSocket]);

  return (
    <Page>
      <ConversationSidebar conversations={prismaConversations} />
        {!id && <ConversationPanel />}
      <Outlet />
    </Page>
  );
};

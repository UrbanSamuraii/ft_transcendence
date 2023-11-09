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
  const [prismaConversations, setPrismaConversations] = useState<any[]>([]); // Define the state to store prismaConversations
	const chatSocketContextData = useContext(chatSocketContext);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const prismaConversations = await getConversations();
        setPrismaConversations(prismaConversations); // Store the prismaConversations directly in the state
        chatSocketContextData?.setNewMessageReceived(false)
        // Start the chat socket connection when the component mounts
        chatSocketContextData?.startChatSocketConnection();
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();

    // return () => {
    //   // Stop the chat socket connection when the component unmounts
    //   chatSocketContextData?.stopChatSocketConnection();
    // };
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

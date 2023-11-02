import { Outlet } from 'react-router-dom';
import { Page } from '../utils/styles';
import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
import { useParams } from 'react-router-dom';
import { ConversationPanel } from '../components/conversations/ConversationPannel';
import { useEffect, useState } from 'react';
import { getConversations } from '../utils/hooks/getConversations';

export const ConversationPage = () => {
  const { id } = useParams();
  const [prismaConversations, setPrismaConversations] = useState<any[]>([]); // Define the state to store prismaConversations

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const prismaConversations = await getConversations();
        // console.log({"prisma Conversations": prismaConversations});
		    setPrismaConversations(prismaConversations); // Store the prismaConversations directly in the state
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  return (
    <Page>
      <ConversationSidebar conversations={prismaConversations} />
      {!id && <ConversationPanel />}
      <Outlet />
    </Page>
  );
};




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






// import { Outlet } from 'react-router-dom';
// import { Page } from '../utils/styles';
// import { ConversationType} from '../utils/types';
// import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
// import { useParams } from "react-router-dom";
// import { ConversationPanel } from '../components/conversations/ConversationPannel';
// import { useState, useEffect } from 'react';
// import { getConversations } from '../utils/hooks/getConversations';

// interface PrismaConversation {
// 	id: number;
// 	name: string;
// 	messages: { message: string }[];
// 	members: { username: string }[];
//  }

// export const ConversationPage = () => {
// 	const { id } = useParams();
// 	const [conversations, setConversations] = useState<ConversationType[]>([]);

// 	useEffect(() => {
// 		const fetchConversations = async () => {
// 			try {
// 				const prismaConversations = await getConversations();
// 				console.log({"CONVERSATIONS in ConversationPage": prismaConversations});
// 				if (Array.isArray(prismaConversations.conversations)) {
// 					const newConversations: ConversationType[] = prismaConversations.conversations.map(
// 					  (prismaConversation: PrismaConversation) => {
// 						return {
// 						  id: prismaConversation.id,
// 						  name: prismaConversation.name,
// 						  messages: prismaConversation.messages.map(
// 							(message: { message: string }) => message.message
// 						  ),
// 						  members: prismaConversation.members.map((member: { username: string }) => {
// 							return { username: member.username };
// 						  }),
// 						};
// 					  }
// 					);
		  
// 					setConversations((prevConversations) => [
// 					  ...prevConversations,
// 					  ...newConversations,
// 					]);
// 				  }
// 			} catch (error) {
// 				console.error('Error fetching conversations:', error);
// 			}
// 		};
	  
// 		fetchConversations();
// 		console.log({"RESULTS CONVERSATIONS": conversations});
// 	  }, []);

// 	  useEffect(() => {
// 		console.log({ "RESULTS CONVERSATIONS": conversations });
// 	  }, [conversations]);
	
// 	// So here the conversations we ve got contain : 
// 	// -	members excluding our current user
// 	// -	the newest message contains in the array

// 	return (
// 		<Page>
// 			<ConversationSidebar conversations={conversations} />
// 			{ !id && <ConversationPanel />}
// 			<Outlet />
// 		</Page>
// 	);
// };
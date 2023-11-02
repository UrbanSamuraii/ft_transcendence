import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ConversationChannelPageStyle } from "../utils/styles"
import { getConversationsIdentified } from "../utils/hooks/getConversationsIdentified";
import { ConversationMessage } from "../utils/types";
import { MessageContainer } from "../components/messages/MessageContainer";
import { useAuth } from '../utils/hooks/useAuth';

export const ConversationChannelPage = () => {
	
	const conversationId  = useParams().id;
	const [conversationsArray, setConversationsArray] = useState<ConversationMessage[]>([]);
	const { user } = useAuth();

	useEffect(() => {
		const fetchConversations = async () => {
		  const conversations = await getConversationsIdentified(conversationId);
		  console.log({"CONVERSATIONS FETCHED IN THE FRONT": conversations});
		  setConversationsArray(conversations);
		};
		
		fetchConversations();
	  }, [conversationId]);

	  return (
		<ConversationChannelPageStyle>
		  {conversationsArray.length > 0 ? (
			conversationsArray.slice().reverse().map((conversation, index) => (
				<MessageContainer key={index} message={conversation}  isCurrentUser={user.username === conversation.authorName}/>
			))
		  ) : (
			<div>No message in the conversation</div>
		  )}
		</ConversationChannelPageStyle>
	  );
	};

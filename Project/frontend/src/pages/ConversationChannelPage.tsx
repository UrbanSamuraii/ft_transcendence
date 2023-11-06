import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from 'react';
import { ConversationChannelPageStyle } from "../utils/styles"
import { getConversationsIdentified } from "../utils/hooks/getConversationsIdentified";
import { ConversationMessage } from "../utils/types";
import { MessageContainer } from "../components/messages/MessageContainer";
import { ScrollableContainer } from "../components/messages/MessagePanel";
import { useAuth } from '../utils/hooks/useAuth';
import { chatSocketContext } from "../utils/context/chatSocketContext";

export const ConversationChannelPage = () => {
	
	const conversationId  = useParams().id;
	const [conversationsArray, setConversationsArray] = useState<ConversationMessage[]>([]);
	const { user } = useAuth();
	const chatSocket = useContext(chatSocketContext);

	useEffect(() => {
		const fetchConversations = async () => {
		  const conversations = await getConversationsIdentified(conversationId);
		  setConversationsArray(conversations);
		};
		
		fetchConversations();
	  }, [conversationId]); // To implement dependencies ! That s how useEffect works

	useEffect(() => {
		chatSocket.on('connected', () => console.log('connected'));

		return() => {
			chatSocket.off('connected');
		};
	}, []);

	  return (
		<ConversationChannelPageStyle>
			<ScrollableContainer>
			{conversationsArray.length > 0 ? (
				conversationsArray.slice().reverse().map((conversation, index) => (
					<MessageContainer key={index} message={conversation} isCurrentUser={user.username === conversation.authorName}/>
				))
			) : (
				<div>No message in the conversation</div>
			)}
			</ScrollableContainer>
		</ConversationChannelPageStyle>
	  );
	};

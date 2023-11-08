import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from 'react';
import { ConversationChannelPageStyle } from "../utils/styles"
import { getConversationsIdentified } from "../utils/hooks/getConversationsIdentified";
import { ConversationMessage } from "../utils/types";
import { MessageContainer } from "../components/messages/MessageContainer";
import { ScrollableContainer } from "../components/messages/MessagePanel";
import { MessagePanelHeader } from "../components/messages/MessagePanelHeader";
import { MessageInputField } from "../components/messages/MessageInputField";
import { useAuth } from '../utils/hooks/useAuth';
import { chatSocketContext } from "../utils/context/chatSocketContext";

export const ConversationChannelPage = () => {
	
	const conversationId  = useParams().id;
	const [conversationsArray, setConversationsArray] = useState<ConversationMessage[]>([]);
	const { user } = useAuth();
	const chatSocketContextData = useContext(chatSocketContext);
	
	useEffect(() => {
		const fetchConversations = async () => {
		  const conversations = await getConversationsIdentified(conversationId);
		  setConversationsArray(conversations);
		};
		
		fetchConversations();
	  }, [conversationId]); // To implement dependencies ! That s how useEffect works

	useEffect(() => {
		chatSocketContextData?.chatSocket?.on('connected', () => console.log('connected'));
		chatSocketContextData?.chatSocket?.on('onMessage', (payload: ConversationMessage) => {
			chatSocketContextData.setNewMessageReceived(true);
			const payloadConversationId = Number(payload.conversation_id);
			if (payloadConversationId === Number(conversationId)) {
				setConversationsArray(prevConversations => [payload, ...prevConversations]);
			}
		});
		return() => {
			chatSocketContextData?.chatSocket?.off('connected');
			chatSocketContextData?.chatSocket?.off('onMessage');
		};
	}, [[chatSocketContextData]]);

	return (
		<ConversationChannelPageStyle>
			<MessagePanelHeader conversationId={Number(conversationId)} />
			<ScrollableContainer>
			{conversationsArray.length > 0 ? (
				conversationsArray.slice().reverse().map((conversation, index) => (
					<MessageContainer key={index} message={conversation} isCurrentUser={user.username === conversation.authorName}/>
					))
					) : (
						<div>No message in the conversation</div>
						)}
					<MessageInputField conversationId={Number(conversationId)} />
			</ScrollableContainer>
		</ConversationChannelPageStyle>
	);
};

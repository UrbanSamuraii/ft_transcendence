import { useParams } from "react-router-dom";
import { useEffect, useState } from 'react';
import { ConversationChannelPageStyle } from "../utils/styles"
import { getConversationsIdentified } from "../utils/hooks/getConversationsIdentified";
import { ConversationMessage } from "../utils/types";
import { MessageContainer } from "../components/messages/MessageContainer";
import { ScrollableContainer } from "../components/messages/MessagePanel";
import { MessagePanelHeader } from "../components/messages/MessagePanelHeader";
import { MessageInputField } from "../components/messages/MessageInputField";
import { useAuth } from '../utils/hooks/useAuth';
import { useChatSocket } from "../utils/context/chatSocketContext";

export const ConversationChannelPage = () => {
	
	const conversationId  = useParams().id;
	const [conversationsArray, setConversationsArray] = useState<ConversationMessage[]>([]);
	const { user } = useAuth();
	const chatSocketContextData = useChatSocket();
	
	useEffect(() => {
		const fetchConversations = async () => {
		  const conversations = await getConversationsIdentified(conversationId);
		  setConversationsArray(conversations);
		};
		
		fetchConversations();
	  }, [conversationId]);

	useEffect(() => {
			chatSocketContextData?.chatSocket?.on('onMessage', (payload: ConversationMessage) => {
			chatSocketContextData.setNewMessageReceived(true);
			chatSocketContextData.setLastMessageDeleted(false);
			console.log({"NOUVEAU MESSAGE DANS LA CONV !": payload});
			const payloadConversationId = Number(payload.conversation_id);
			if (payloadConversationId === Number(conversationId)) {
				setConversationsArray(prevConversations => [payload, ...prevConversations]);
			}
		});
		return() => {
			chatSocketContextData?.chatSocket?.off('onMessage');
		};
	}, [[chatSocketContextData]]);

	useEffect(() => {
		chatSocketContextData?.chatSocket?.on('onDeleteMessage', (deletedMessage: ConversationMessage) => {
		const isMessageInConversation = deletedMessage.conversation_id === Number(conversationId);
		
		if (isMessageInConversation) {
			setConversationsArray(prevConversations => {
			return prevConversations.filter(message => message.id !== deletedMessage.id);
			});
		}
		});
		return () => {
		  chatSocketContextData?.chatSocket?.off('onDeleteMessage');
		};
	}, [chatSocketContextData, conversationId]);

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

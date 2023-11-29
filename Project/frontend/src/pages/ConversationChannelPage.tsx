import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, FC } from 'react';
import { ConversationChannelPageStyle } from "../utils/styles"
import { getConversationsIdentified } from "../utils/hooks/getConversationsIdentified";
import { ConversationMessage } from "../utils/types";
import { MessageContainer } from "../components/messages/MessageContainer";
import { ScrollableContainer } from "../components/messages/MessagePanel";
import { MessagePanelHeader } from "../components/messages/MessagePanelHeader";
import { MessageInputField } from "../components/messages/MessageInputField";
import { useAuth } from '../utils/hooks/useAuthHook';
import { useSocket } from '../SocketContext';


interface ConversationMenuProps {
    onClose: () => void;
    onOptionClick: (option: string) => void;
}
  
const CreateConversationMenu: FC<ConversationMenuProps> = ({ onClose, onOptionClick }) => {
    return (
        <div className="menu-container">
            <button className="menu-button" onClick={() => onOptionClick('create')}>Create a conversation</button>
            <button className="menu-button" onClick={() => onOptionClick('join')}>Join a conversation</button>
            <button className="menu-button" onClick={() => onOptionClick('block')}>Block a user</button>
            <button className="menu-button" onClick={onClose}>Cancel</button>
        </div>
    );
};

export const ConversationChannelPage = () => {

    const conversationId = useParams().id;
    const [conversationsArray, setConversationsArray] = useState<ConversationMessage[]>([]);
    const { user } = useAuth();
    const chatSocketContextData = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const conversations = await getConversationsIdentified(conversationId);
                setConversationsArray(conversations);}
            catch (error) {
                navigate('/Play');
            }
        };

        fetchConversations();
    }, [conversationId]);

    useEffect(() => {
        chatSocketContextData?.socket?.on('onMessage', (payload: ConversationMessage) => {
            chatSocketContextData.setNewMessageReceived(true);
            chatSocketContextData.setLastMessageDeleted(false);
            // console.log({ "NOUVEAU MESSAGE DANS LA CONV !": payload });
            const payloadConversationId = Number(payload.conversation_id);
            if (payloadConversationId === Number(conversationId)) {
                setConversationsArray(prevConversations => [payload, ...prevConversations]);
            }
        });
        return () => {
            chatSocketContextData?.socket?.off('onMessage');
        };
    }, [[chatSocketContextData, conversationId]]);

    useEffect(() => {
        chatSocketContextData?.socket?.on('onDeleteMessage', (deletedMessage: ConversationMessage) => {
            const isMessageInConversation = deletedMessage.conversation_id === Number(conversationId);

            if (isMessageInConversation) {
                setConversationsArray(prevConversations => {
                    return prevConversations.filter(message => message.id !== deletedMessage.id);
                });
            }
        });
        return () => {
            chatSocketContextData?.socket?.off('onDeleteMessage');
        };
    }, [chatSocketContextData, conversationId]);

    return (
        <ConversationChannelPageStyle>
            <MessagePanelHeader conversationId={Number(conversationId)} />
            <ScrollableContainer>
                {conversationsArray.length > 0 ? (
                    conversationsArray.slice().reverse().map((conversation, index) => (
                        <MessageContainer key={index} message={conversation} isCurrentUser={user.username === conversation.authorName} />
                    ))
                ) : (
                    <div>No message in the conversation</div>
                )}
                <MessageInputField conversationId={Number(conversationId)} />
            </ScrollableContainer>
        </ConversationChannelPageStyle>
    );
};

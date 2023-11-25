import { ConversationSidebarContainer, ConversationSidebarItem, ConversationSidebarStyle, ConversationSidebarTexts } from '../../utils/styles';
import { MdPostAdd } from 'react-icons/md';
import { ConversationType } from '../../utils/types';
import { FC, useState, useContext, useEffect } from 'react';
import './GlobalConversations.css';
import { useNavigate } from 'react-router-dom';
import { CreateConversationModal } from '../modals/CreateConversationModal';
import { ButtonOverlay } from '../../utils/styles';
// import { chatSocketContext } from "../../utils/context/chatSocketContext";
import { useSocket } from '../../SocketContext';

type Props = {
    conversations: ConversationType[];
}

export const ConversationSidebar: FC<Props> = ({ conversations }) => {

    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);
    const [lastMessageDeletedMap, setLastMessageDeletedMap] = useState<Record<string, boolean>>({});
    const chatSocketContextData = useSocket();

    useEffect(() => {
        // When isLastMessageDeleted changes in the context, update the corresponding entry in the map
        if (chatSocketContextData?.isLastMessageDeleted !== undefined) {
            setLastMessageDeletedMap(prevMap => ({
                ...prevMap,
                [chatSocketContextData.conversationId || ""]: chatSocketContextData.isLastMessageDeleted || false
            }));
            chatSocketContextData.setLastMessageDeleted(false);
        }
    }, [chatSocketContextData?.isLastMessageDeleted, chatSocketContextData?.conversationId]);

    return (
        <>
            {showModal && <CreateConversationModal setShowModal={setShowModal} />}
            <ConversationSidebarStyle>
                <header>
                    <div className="header-content">
                        <h2>Conversations</h2>
                        <ButtonOverlay onClick={() => {
                            setShowModal(!showModal);
                        }}>
                            <MdPostAdd size={30} /> </ButtonOverlay>
                    </div>
                </header>
                <ConversationSidebarContainer>
                    {conversations.map((conversation) => (
                        <ConversationSidebarItem key={conversation.id} onClick={() => navigate(`/ConversationPage/channel/${conversation.id}`)}>
                            <div className='conversationAvatar'>
                            </ div>
                            <ConversationSidebarTexts>
                                <div className="conversationName">
                                    <div> <span>{conversation.name || conversation.members[0].username}</span> </div>
                                </div>
                                <div className="conversationLastMessage">
                                    {/* <div><span>{conversation.messages[0]?.message}</span> </div> */}
                                    <div>
                                        <span>{lastMessageDeletedMap[conversation.id] ? 'Last message deleted' : conversation.messages[0]?.message}</span>
                                    </div>
                                </div>
                            </ConversationSidebarTexts>
                        </ ConversationSidebarItem>))}
                </ConversationSidebarContainer>
            </ConversationSidebarStyle>
        </>
    );
};

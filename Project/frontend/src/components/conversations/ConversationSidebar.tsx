import { ConversationSidebarContainer, ConversationSidebarItem, ConversationSidebarStyle, ConversationSidebarTexts } from '../../utils/styles';
import { MdPostAdd } from 'react-icons/md';
import { ConversationType } from '../../utils/types';
import { FC, useState, useEffect } from 'react';
import './GlobalConversations.css';
import { ConversationMessage } from "../../utils/types";
import { useNavigate } from 'react-router-dom';
import { CreateConversationModal } from '../modals/CreateConversationModal';
import { JoinConversationModal } from '../modals/JoinConversationModal';
import { ConversationMenuModal } from '../modals/CreateConversationMenuModal';
import { ButtonOverlay } from '../../utils/styles';
import { useSocket } from '../../SocketContext';

type Props = {
    conversations: ConversationType[];
}

export const ConversationSidebar: FC<Props> = ({ conversations }) => {

    const navigate = useNavigate();
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [showModalJoin, setShowModalJoin] = useState(false);

    const [lastMessageDeletedMap, setLastMessageDeletedMap] = useState<Record<string, boolean>>({});
    const chatSocketContextData = useSocket();
    const { isLastMessageDeleted, setLastMessageDeleted, conversationId } = useSocket();  

    // useEffect(() => {
    //     console.log({"Last message deleted": isLastMessageDeleted});
    //     if (isLastMessageDeleted !== undefined) {
    //         setLastMessageDeletedMap(prevMap => ({
    //             ...prevMap,
    //             [chatSocketContextData.conversationId || ""]: chatSocketContextData.isLastMessageDeleted || false
    //         }));
    //         setLastMessageDeleted(false);
    //     }
    // }, [isLastMessageDeleted, conversationId]);

    useEffect(() => {
        chatSocketContextData?.socket?.on('onDeleteLastMessage', (deletedMessage: ConversationMessage) => {
            chatSocketContextData.setLastMessageDeleted(true);
            // console.log("Message du serveur LAST MESSAGE DELETED");
            setLastMessageDeletedMap(prevMap => ({
                ...prevMap,
                [chatSocketContextData.conversationId || ""]: chatSocketContextData.isLastMessageDeleted || false
            }));
            // console.log({ "DELETING LAST !": deletedMessage });
        });
        return () => {
            chatSocketContextData.setLastMessageDeleted(false);
            chatSocketContextData?.socket?.off('onDeleteLastMessage');
        };
    }, [[chatSocketContextData, conversationId, isLastMessageDeleted]]);

    const handleMenuOptionClick = (option: string) => {
        // console.log('Selected option:', option);
        setShowMenuModal(false);
        if (option === 'create') {
            setShowModalCreate(true);
        }
        else if (option === 'join') {
            setShowModalJoin(true);
        }
    };
    
      const openMenu = () => {
        console.log("OPEN");
        setShowMenuModal(true);
    };
    
      const closeMenu = () => {
        console.log('Closing menu');
        setShowMenuModal(false);
    };

    return (
        <>
            {showMenuModal && ( <ConversationMenuModal
                setShowModal={() => {
                    setShowMenuModal(false);}}
                    onClose={closeMenu}
                    onOptionClick={handleMenuOptionClick}
                />)}
            {showModalCreate && (<CreateConversationModal
                setShowModal={() => {
                    setShowModalCreate(false);
                    setShowMenuModal(false);
                }} /> )}
            {showModalJoin && (<JoinConversationModal
                setShowModal={() => {
                    setShowModalJoin(false);
                    setShowMenuModal(false);
                }} /> )}
            <ConversationSidebarStyle>
                <header>
                    <div className="header-content">
                        <h2>Conversations</h2>
                        <ButtonOverlay onClick={openMenu}>
                            <MdPostAdd size={30} />{' '}
                        </ButtonOverlay>
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

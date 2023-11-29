import { ConversationSidebarContainer, ConversationSidebarItem, ConversationSidebarStyle, ConversationSidebarTexts } from '../../utils/styles';
import { MdPostAdd } from 'react-icons/md';
import { ConversationType } from '../../utils/types';
import { FC, useState, useEffect } from 'react';
import './GlobalConversations.css';
import { useNavigate } from 'react-router-dom';
import { CreateConversationModal } from '../modals/CreateConversationModal';
import { JoinConversationModal } from '../modals/JoinConversationModal';
import { ConversationMenuModal } from '../modals/ConversationMenuModal';
import { ButtonOverlay } from '../../utils/styles';
import { useSocket } from '../../SocketContext';

type Props = {
    conversations: ConversationType[];
}

export interface CreateConversationMenuProps {
    setShowModal: (show: boolean) => void;
    onClose: () => void;
    onOptionClick: (option: string) => void;
}
  
export const CreateConversationMenu: FC<CreateConversationMenuProps> = ({ onClose, onOptionClick, setShowModal }) => {
    return (
        <div className="menu-container">
            <button className="menu-button" onClick={() => onOptionClick('create')}>Create a conversation</button>
            <button className="menu-button" onClick={() => onOptionClick('join')}>Join a conversation</button>
            <button className="menu-button" onClick={() => onOptionClick('block')}>Block a user</button>
            <button className="menu-button" onClick={onClose}>Cancel</button>
        </div>
    );
};

export const ConversationSidebar: FC<Props> = ({ conversations }) => {

    const navigate = useNavigate();
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [showModalCreate, setShowModalCreate] = useState(false);
    const [showModalJoin, setShowModalJoin] = useState(false);
    const [lastMessageDeletedMap, setLastMessageDeletedMap] = useState<Record<string, boolean>>({});
    const chatSocketContextData = useSocket();
    const { isLastMessageDeleted, setLastMessageDeleted } = useSocket();  

    useEffect(() => {
        if (isLastMessageDeleted !== undefined) {
            setLastMessageDeletedMap(prevMap => ({
                ...prevMap,
                [chatSocketContextData.conversationId || ""]: chatSocketContextData.isLastMessageDeleted || false
            }));
            setLastMessageDeleted(false);
        }
    }, [isLastMessageDeleted, chatSocketContextData?.conversationId]);

    const handleMenuOptionClick = (option: string) => {
        console.log('Selected option:', option);
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

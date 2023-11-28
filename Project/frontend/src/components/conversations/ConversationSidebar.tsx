import { ConversationSidebarContainer, ConversationSidebarItem, ConversationSidebarStyle, ConversationSidebarTexts } from '../../utils/styles';
import { MdPostAdd } from 'react-icons/md';
import { ConversationType } from '../../utils/types';
import { FC, useState, useEffect } from 'react';
import './GlobalConversations.css';
import { useNavigate } from 'react-router-dom';
import { CreateConversationModal } from '../modals/CreateConversationModal';
import { ButtonOverlay } from '../../utils/styles';
import { useSocket } from '../../SocketContext';

type Props = {
    conversations: ConversationType[];
}

interface CreateConversationMenuProps {
    onClose: () => void;
    onOptionClick: (option: string) => void;
}
  
const CreateConversationMenu: FC<CreateConversationMenuProps> = ({ onClose, onOptionClick }) => {
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
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
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
        setShowMenu(false);
        if (option === 'create') {
            setShowModal(true);
        }
    };
    
      const openMenu = () => {
        console.log("OPEN");
        setShowMenu(true);
    };
    
      const closeMenu = () => {
        console.log('Closing menu');
        setShowMenu(false);
    };

    return (
        <>
            {showMenu && <CreateConversationMenu onClose={closeMenu} onOptionClick={handleMenuOptionClick} />}
            {showModal && (<CreateConversationModal
                    setShowModal={() => {
                        setShowModal(false);
                        setShowMenu(false);
                    }} /> )}
            <ConversationSidebarStyle>
                <header>
                    <div className="header-content">
                        <h2>Conversations</h2>
                        {/* <ButtonOverlay onClick={() => {
                            setShowModal(!showModal);
                        }}>
                            <MdPostAdd size={30} /> </ButtonOverlay> */}
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

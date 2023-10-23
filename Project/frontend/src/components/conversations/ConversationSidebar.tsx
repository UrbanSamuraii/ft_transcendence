import { ConversationSidebarContainer, ConversationSidebarItem, ConversationSidebarStyle, ConversationSidebarTexts } from '../../utils/styles';
import { MdPostAdd } from 'react-icons/md';  
import { ConversationType } from '../../utils/types';
import { FC } from 'react';
import './GlobalConversations.css';
import { useNavigate } from 'react-router-dom';

type Props = {
	conversations: ConversationType[];
}

export const ConversationSidebar: FC<Props> = ({ conversations }) => {
	
	const navigate = useNavigate();

	return (
	<ConversationSidebarStyle>
		<header>
			<div className="header-content">
				<h2>Conversations</h2>
					<MdPostAdd size={30} />
			</div>
		</header>
		<ConversationSidebarContainer>
			{conversations.map((conversation) => (
			<ConversationSidebarItem onClick={() => navigate(`/ConversationPage/channel/${conversation.id}`)}>
				<div className='conversationAvatar'>
				</ div>
				<ConversationSidebarTexts>
					<div className="conversationName">
						<div> <span>{conversation.name}</span> </div>
					</div>
					<div className="conversationLastMessage">
						<div><span>{conversation.lastMessage}</span> </div>
					</div>
				</ConversationSidebarTexts>
			</ ConversationSidebarItem>))}
		</ConversationSidebarContainer>
	</ConversationSidebarStyle>
	);
};
  
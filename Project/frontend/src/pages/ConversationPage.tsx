import { Outlet } from 'react-router-dom';
import { Page } from '../utils/styles';
import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
import { useParams } from "react-router-dom";
import { ConversationPanel } from '../components/conversations/ConversationPannel';
import mockConversations from '../_mocks_/conversations';

export const ConversationPage = () => {
	const { id } = useParams();
	return (
		<Page>
			<ConversationSidebar conversations={mockConversations} />
			{ !id && <ConversationPanel />}
			<Outlet />
		</Page>
	);
};
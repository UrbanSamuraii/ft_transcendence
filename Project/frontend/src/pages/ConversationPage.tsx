import { Outlet } from 'react-router-dom';
import { Page } from '../utils/styles';
import { ConversationSidebar } from '../components/conversations/ConversationSidebar';
import { useParams } from "react-router-dom";
import { ConversationPanel } from '../components/conversations/ConversationPannel';
import mockConversations from '../_mocks_/conversations';
import { useState, useEffect } from 'react';
import { getConversations } from '../utils/hooks/getConversations';

export const ConversationPage = () => {
	const { id } = useParams();
	const [conversations, setConversations] = useState([]);

	useEffect(() => {
		const fetchConversations = async () => {
			try {
				const { conversations } = await getConversations();
				setConversations(conversations);
			} catch (error) {
				console.error('Error fetching conversations:', error);
			}
		};

		fetchConversations();
	}, []);

	return (
		<Page>
			<ConversationSidebar conversations={[]} />
			{ !id && <ConversationPanel />}
			<Outlet />
		</Page>
	);
};
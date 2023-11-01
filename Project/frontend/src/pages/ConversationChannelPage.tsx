import { useParams } from "react-router-dom";
import { ConversationChannelPageStyle } from "../utils/styles"
import { getConversationsIdentified } from "../utils/hooks/getConversationsIdentified";

export const ConversationChannelPage = () => {
	console.log({"USEPARAMS()":useParams()});
	const id = useParams();

	const fetchConversations = async () => {
		const conversations = await getConversationsIdentified(id); // Pass the id as an argument
	};
	
	fetchConversations();

	return (
		<ConversationChannelPageStyle>
			Channel Page
		</ConversationChannelPageStyle>
	);
};

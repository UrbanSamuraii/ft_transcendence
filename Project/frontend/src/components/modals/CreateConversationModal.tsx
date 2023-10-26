import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { CreateConversationForm } from '../conversations/CreateConversationForm'

export const CreateConversationModal = () => {

	return (
	<OverlayStyle>
		<OverlayContent>
			<CreateConversationForm />
		</OverlayContent>
	</OverlayStyle>
	);
};
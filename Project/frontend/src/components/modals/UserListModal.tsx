import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { UpgradeMemberConversationForm } from '../forms/UpgradeMemberConversationForm';
import OutsideClickHandler from 'react-outside-click-handler';

type UserListModalProps = {
	setShowModal: (show: boolean) => void;
	
};

export const UnMuteMemberInConversationModal: React.FC<UserListModalProps> = ({ setShowModal }) => {

	return (
		<OverlayStyle>
			<OutsideClickHandler onOutsideClick={() => {
				console.log('Close Modal');
				setShowModal(false);
			}}>
				<OverlayContent>
					<UpgradeMemberConversationForm setShowModal={setShowModal}/>
				</OverlayContent>
			</OutsideClickHandler>
		</OverlayStyle>
	);
};
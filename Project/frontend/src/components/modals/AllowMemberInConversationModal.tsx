import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { AllowMemberInConversationForm } from '../forms/UnMuteMemberInConversationForm';
import OutsideClickHandler from 'react-outside-click-handler';

type AllowConversationModalProps = {
	setShowModal: (show: boolean) => void;
};

export const AllowMemberInConversationModal: React.FC<AllowConversationModalProps> = ({ setShowModal }) => {

	return (
		<OverlayStyle>
			<OutsideClickHandler onOutsideClick={() => {
				console.log('Close Modal');
				setShowModal(false);
			}}>
				<OverlayContent>
					<AllowMemberInConversationForm setShowModal={setShowModal}/>
				</OverlayContent>
			</OutsideClickHandler>
		</OverlayStyle>
	);
};
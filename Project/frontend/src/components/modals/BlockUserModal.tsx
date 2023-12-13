import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { BlockConversationForm } from '../forms/BlockConversationForm';
import OutsideClickHandler from 'react-outside-click-handler';

type BlockConversationModalProps = {
	setShowModal: (show: boolean) => void;
};

export const BlockUserModal: React.FC<BlockConversationModalProps> = ({ setShowModal }) => {

	return (
		<OverlayStyle>
			<OutsideClickHandler onOutsideClick={() => {
				console.log('Close Modal');
				setShowModal(false);
			}}>
				<OverlayContent>
					<BlockConversationForm setShowModal={setShowModal}/>
				</OverlayContent>
			</OutsideClickHandler>
		</OverlayStyle>
	);
};
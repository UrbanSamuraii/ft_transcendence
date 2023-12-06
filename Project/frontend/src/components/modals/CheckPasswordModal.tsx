import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { CheckPasswordForm } from '../forms/CheckPasswordForm';
import OutsideClickHandler from 'react-outside-click-handler';

type CheckPasswordModalProps = {
	setShowModal: (show: boolean) => void;
	// conversationId: string; 
};

// export const CheckPasswordModal: React.FC<CheckPasswordModalProps> = ({ setShowModal, conversationId }) => {
export const CheckPasswordModal: React.FC<CheckPasswordModalProps> = ({ setShowModal }) => {

	return (
		<OverlayStyle>
			<OutsideClickHandler onOutsideClick={() => {
				console.log('Close Modal');
				setShowModal(false);
			}}>
				<OverlayContent>
					<CheckPasswordForm setShowModal={setShowModal}/>
				</OverlayContent>
			</OutsideClickHandler>
		</OverlayStyle>
	);
};
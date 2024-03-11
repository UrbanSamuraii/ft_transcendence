import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { GoToProfileForm } from '../forms/GoToProfileForm';
import OutsideClickHandler from 'react-outside-click-handler';

type GoToProfileModalProps = {
	setShowModal: (show: boolean) => void;
};

export const GoToProfileModal: React.FC<GoToProfileModalProps> = ({ setShowModal }) => {

	return (
		<OverlayStyle>
			<OutsideClickHandler onOutsideClick={() => {
				console.log('Close Modal');
				setShowModal(false);
			}}>
				<OverlayContent>
					<GoToProfileForm setShowModal={setShowModal}/>
				</OverlayContent>
			</OutsideClickHandler>
		</OverlayStyle>
	);
};

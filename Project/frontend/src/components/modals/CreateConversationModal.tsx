import { OverlayStyle, OverlayContent  } from '../../utils/styles';
import { CreateConversationForm } from '../conversations/CreateConversationForm'
import { createRef } from 'react';
import OutsideClickHandler from 'react-outside-click-handler';

type CreateConversationModalProps = {
	setShowModal: (show: boolean) => void;
};

export const CreateConversationModal: React.FC<CreateConversationModalProps> = ({ setShowModal }) => {

	// const ref = createRef<HTMLDivElement>();

	return (
	// <OverlayStyle ref={ref} onClick={(e) => {
	// 	const { current } = ref;
	// 	if (current === e.target) {
	// 		console.log('Close Modal');
	// 		setShowModal(false);
	// 		}
	// 	}}>
		<OverlayStyle>
			<OutsideClickHandler onOutsideClick={() => {
			console.log('Close Modal');
			setShowModal(false);
			}}>
				<OverlayContent>
					<CreateConversationForm />
				</OverlayContent>
			</OutsideClickHandler>
		</OverlayStyle>
	);
};
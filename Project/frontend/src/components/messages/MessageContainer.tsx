import { MessageContainerStyle, MessageContainerPersonnalStyle, DarkRedButton } from '../../utils/styles';
import { ConversationMessage } from '../../utils/types';
import { FC, useState, useContext } from 'react';
import axios from 'axios';
import { useSocket } from '../../SocketContext';

import './GlobalMessages.css'

type ConversationMessageProps = {
  message: ConversationMessage;
  isCurrentUser: boolean;
};

export const MessageContainer: FC<ConversationMessageProps> = ({ message, isCurrentUser }) => {
	
	const updatedAtDate = new Date(message.updatedAt);
	const updatedAtFormatted = `${updatedAtDate.getFullYear()}-${(updatedAtDate.getMonth() + 1).toString().padStart(2, '0')}-${updatedAtDate.getDate()} at ${updatedAtDate.getHours()}:${updatedAtDate.getMinutes()}:${updatedAtDate.getSeconds()}`;
	const [showDeleteButton, setShowDeleteButton] = useState(false);
	const chatSocketContextData = useSocket();

	const handleContextMenu = (event: React.MouseEvent) => {
		event.preventDefault();
		setShowDeleteButton(true);
	};

	const handleDelete = async(messageToDelete: ConversationMessage) => {
		console.log('Deleting Message:', messageToDelete);
		const response = await axios.post('http://localhost:3001/messages/deleteMessage', { messageToDelete: messageToDelete }, {
          withCredentials: true,
        });
		if (response.data.isLastMessageDeleted === true) {
			console.log("LAST MESSAGE DELETED");
			console.log({"CONV ID": messageToDelete.conversation_id});
			chatSocketContextData?.setLastMessageDeleted(true);
			chatSocketContextData?.setConversationId(messageToDelete.conversation_id);
		}
		setShowDeleteButton(false);
	};

	if (isCurrentUser === true) {
		return (
			<MessageContainerPersonnalStyle onContextMenu={handleContextMenu} onMouseLeave={() => setShowDeleteButton(false)}>
			<div className="messageAuthorName">
				{message.authorName}:
			</div>
			<div className="messageText">
				{message.message}
			</div>
			<div className="dateMessage">
				{updatedAtFormatted}
			</div>
			{showDeleteButton && ( <DarkRedButton onClick={() => handleDelete(message)}>Delete</DarkRedButton> )}
			</MessageContainerPersonnalStyle>
		);
	}
	else {
		return (
			<MessageContainerStyle>
			<div className="messageAuthorName">
				{message.authorName}:
			</div>
			<div className="messageText">
				{message.message}
			</div>
			<div className="dateMessage">
				{updatedAtFormatted}
			</div>
			</MessageContainerStyle>
		);
	}
};
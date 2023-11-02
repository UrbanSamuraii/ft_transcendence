import { MessageContainerStyle, MessageContainerPersonnalStyle } from '../../utils/styles';
import { ConversationMessage } from '../../utils/types';
import { FC } from 'react';
import './GlobalMessages.css'

type ConversationMessageProps = {
  message: ConversationMessage;
  isCurrentUser: boolean;
};

export const MessageContainer: FC<ConversationMessageProps> = ({ message, isCurrentUser }) => {
	
	const updatedAtDate = new Date(message.updatedAt);
	const updatedAtFormatted = `${updatedAtDate.getFullYear()}-${(updatedAtDate.getMonth() + 1).toString().padStart(2, '0')}-${updatedAtDate.getDate()} at ${updatedAtDate.getHours()}:${updatedAtDate.getMinutes()}:${updatedAtDate.getSeconds()}`;

	
	if (isCurrentUser === true) {
		return (
			<MessageContainerPersonnalStyle>
		<div className="messageAuthorName">
			{message.authorName}:
		</div>
		<div className="messageText">
			{message.message}
		</div>
		<div className="dateMessage">
			{updatedAtFormatted}
		</div>
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
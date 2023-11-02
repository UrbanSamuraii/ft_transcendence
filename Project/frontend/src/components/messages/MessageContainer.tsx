import { MessageContainerStyle, MessageContainerPersonnalStyle } from '../../utils/styles';
import { ConversationMessage } from '../../utils/types';
import { FC } from 'react';
import './GlobalMessages.css'

type ConversationMessageProps = {
  message: ConversationMessage;
  isCurrentUser: boolean;
};

export const MessageContainer: FC<ConversationMessageProps> = ({ message, isCurrentUser }) => {
	if (isCurrentUser === true) {
		return (
			<MessageContainerPersonnalStyle>
		<div className="messageAuthorName">
			{message.authorName}:
		</div>
		<div className="messageText">
			{message.message}
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
			</MessageContainerStyle>
		);
	}
};
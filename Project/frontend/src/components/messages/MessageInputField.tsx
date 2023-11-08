import './GlobalMessages.css';
import { MessageInputFieldStyle } from '../../utils/styles';
import { MessageInputTextForm } from '../forms/MessageTextForm';
import React, { FC } from "react";

export type MessageInputFieldProps = {
	conversationId: number;
};

export const MessageInputField: FC<MessageInputFieldProps> = ({ conversationId }) => {
	return (
	  <MessageInputFieldStyle>
		<div className='MessageInputContainer'>
		<MessageInputTextForm conversationId={Number(conversationId)} />
		<button className="MessageSendButton">
			<span className="MessageSendIcon">📨</span>
		</button>
		</div>
	  </MessageInputFieldStyle>
	);
  };
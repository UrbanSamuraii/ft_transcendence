import './GlobalMessages.css';
import axios from 'axios';
import React, { useEffect, useState, FC } from "react";
import { MessageContainerHeaderStyle } from '../../utils/styles';

type MessagePanelHeaderProps = {
	conversationId: number;
};

export const MessagePanelHeader : FC<MessagePanelHeaderProps> = ({ conversationId }) => {
	
	const [conversationName, setConversationName] = useState<string | null>(null);
	
	useEffect(() => {
        const fetchConversationName = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/conversations/${conversationId}`, {
					withCredentials: true,
				  });
                // console.log({"SHOULD BE CONV TITLE": response.data.name});
				setConversationName(response.data.name);
            } catch (error) {
                console.error('Error fetching conversation name:', error);
            }
        };

        fetchConversationName();
    }, [conversationId]);
	
	return (
		<MessageContainerHeaderStyle>
			<div className="messagePanelTitle">
				{conversationName}
			</div>
		</MessageContainerHeaderStyle>
	);
}
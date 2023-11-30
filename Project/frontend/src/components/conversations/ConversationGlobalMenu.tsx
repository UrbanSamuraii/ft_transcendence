import { FC } from "react";
import './GlobalConversations.css'

export interface CreateConversationMenuProps {
    setShowModal: (show: boolean) => void;
    onClose: () => void;
    onOptionClick: (option: string) => void;
}
  
export const CreateConversationMenu: FC<CreateConversationMenuProps> = ({ onClose, onOptionClick, setShowModal }) => {
    return (
        <div className="menu-container">
			<div className="menu-title">Conversation Global Menu</div>
            <button className="menu-button" onClick={() => onOptionClick('create')}>Create a conversation</button>
            <button className="menu-button" onClick={() => onOptionClick('join')}>Join a conversation</button>
            <button className="menu-button" onClick={() => onOptionClick('block')}>Block a user</button>
            <button className="menu-button" onClick={onClose}>Cancel</button>
        </div>
    );
};
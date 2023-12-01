import './GlobalMessages.css';
import axios from 'axios';
import { useEffect, useState, FC, useRef } from "react";
import { MessageContainerHeaderStyle } from '../../utils/styles';
import { useAuth } from '../../AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AddMemberToConversationModal } from '../modals/AddMemberToConversationModal';

type MessagePanelHeaderProps = {
	conversationId: number;
};

const HamburgerIcon = () => (
	<svg
	  xmlns="http://www.w3.org/2000/svg"
	  width="40"
	  height="40"
	  viewBox="0 0 30 30"
	  fill="none"
	  stroke="currentColor"
	  strokeWidth="2"
	  strokeLinecap="round"
	  strokeLinejoin="round"
	>
	  <line x1="3" y1="12" x2="21" y2="12" />
	  <line x1="3" y1="6" x2="21" y2="6" />
	  <line x1="3" y1="18" x2="21" y2="18" />
	</svg>
);

export const MessagePanelHeader : FC<MessagePanelHeaderProps> = ({ conversationId }) => {
	
	const [conversationName, setConversationName] = useState<string | null>(null);
	const { user } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);

	const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

	useEffect(() => {
        function handleClickOutside(event: any) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


	useEffect(() => {
        const fetchConversationName = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/conversations/${conversationId}`, {
					withCredentials: true,
				  });
				setConversationName(response.data.name);
            } catch (error) {
                console.error('Error fetching conversation name:', error);
            }
        };

        fetchConversationName();
    }, [conversationId]);
	
	return (
		<>
			{showAddMemberModal && (<AddMemberToConversationModal
                setShowModal={() => {
                    setShowAddMemberModal(false);
                }} /> )}
			<MessageContainerHeaderStyle>
				<div className="messagePanelTitle">
					{conversationName}
				</div>
				<div className="convMenu">
					{user ? (
						<>
							<div onClick={toggleDropdown} className="profile-name"> <HamburgerIcon />
								{isDropdownOpen && (
									<div className="dropdown-menu">
										<button className="convMenuButton" onClick={() => setShowAddMemberModal(true)}>Add Member</button>
									</div>
								)}
							</div>
						</>
					) : (
						<button onClick={() => navigate('/login')}>SIGN IN</button>
					)}
				</div>
			</MessageContainerHeaderStyle>
		</>
	);
}
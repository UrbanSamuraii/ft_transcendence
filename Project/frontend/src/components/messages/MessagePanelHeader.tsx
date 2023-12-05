import './GlobalMessages.css';
import axios from 'axios';
import { useEffect, useState, FC, useRef } from "react";
import { MessageContainerHeaderStyle } from '../../utils/styles';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../SocketContext';

import OutsideClickHandler from 'react-outside-click-handler';
import { AddMemberToConversationModal } from '../modals/AddMemberToConversationModal';
import { RemoveMemberFromConversationModal } from '../modals/RemoveMemberFromConversationModal';
import { MuteMemberInConversationModal } from '../modals/MuteMemberInConversationModal';
import { UnMuteMemberInConversationModal } from '../modals/UnMuteMemberInConversationModal';
import { UpgradeMemberInConversationModal } from '../modals/UpgradeMemberInConversationModal';
import { DowngradeMemberInConversationModal } from '../modals/DowngradeMemberInConversationModal';
import { BanUserFromConversationModal} from '../modals/BanUserFromConversationModal';
import { AllowMemberInConversationModal } from '../modals/AllowMemberInConversationModal';

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

const LockIcon = () => (
	<svg
	  xmlns="http://www.w3.org/2000/svg"
	  width="30"
	  height="30"
	  viewBox="0 0 24 24"
	  fill="none"
	  stroke="currentColor"
	  strokeWidth="2"
	  strokeLinecap="round"
	  strokeLinejoin="round"
	>
	  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
	  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
	</svg>
  );

export const MessagePanelHeader : FC<MessagePanelHeaderProps> = ({ conversationId }) => {
	
	const [conversationName, setConversationName] = useState<string | null>(null);
	const { user } = useAuth();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);
	const [isPrivate, setIsPrivate] = useState(false);
	const [showAddMemberModal, setShowAddMemberModal] = useState(false);
	const [showRemoveMemberModal, setShowRemoveMemberModal] = useState(false);
    const [showMuteMemberModal, setShowMuteMemberModal] = useState(false);
    const [showUnMuteMemberModal, setShowUnMuteMemberModal] = useState(false);
    const [showUpgradeMemberModal, setShowUpgradeMemberModal] = useState(false);
    const [showDowngradeMemberModal, setShowDowngradeMemberModal] = useState(false);
    const [showBanUserModal, setShowBanUserModal] = useState(false);
    const [showAllowUserModal, setShowAllowUserModal] = useState(false);
	const [isOwner, setIsOwner] = useState(false);
	const socketContextData = useSocket();

	const handleOutsideClick = () => {
		setIsOpen(false);
		setIsDropdownOpen(false);
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
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


	useEffect(() => {
		const fetchPrivacyStatus = async () => {
		  try {
			const response = await axios.get(`http://localhost:3001/conversations/${conversationId}/status`, {
			  withCredentials: true,
			});
			setIsPrivate(response.data === 'PRIVATE');
		  } catch (error) {
			console.error('Error fetching conversation privacy status:', error);
		  }
		};
		fetchPrivacyStatus();
	  
		const onChangePrivacyHandler = (payload: any) => {
		  console.log("Change of privacy", payload.privacy);
		  setIsPrivate(payload.privacy === 'PRIVATE');
		};
		socketContextData?.socket?.on('onChangePrivacy', onChangePrivacyHandler);
		return () => {
		  socketContextData?.socket?.off('onChangePrivacy', onChangePrivacyHandler);
		};
	  }, [socketContextData, conversationId]);


	useEffect(() => {
		const fetchOwnerStatus = async () => {
		  try {
			const response = await axios.get(`http://localhost:3001/conversations/${conversationId}/owner`, {
			  withCredentials: true,
			});
			setIsOwner(response.data.id === user?.id);
		  } catch (error) {
			console.error('Error fetching conversation owner status:', error);
		  }
		};
	
		fetchOwnerStatus();
	  }, [conversationId, user]);

	  
	const handleTogglePrivacy = async () => {
		try {
			if (isPrivate) {
				await axios.get(`http://localhost:3001/conversations/${conversationId}/set_public`, {
					withCredentials: true,});
			} else {
			  const response = await axios.get(`http://localhost:3001/conversations/${conversationId}/set_private`, {
			  withCredentials: true,});
			}
			setIsPrivate(!isPrivate);
		} catch (error) {
		  console.error('Error toggling conversation privacy:', error);
		}
	};
	  
	return (
		<>
			{showAddMemberModal && (<AddMemberToConversationModal
                setShowModal={() => {
                    setShowAddMemberModal(false);
                }} /> )}
			{showRemoveMemberModal && (<RemoveMemberFromConversationModal
                setShowModal={() => {
                    setShowRemoveMemberModal(false);
                }} /> )}
			{showMuteMemberModal && (<MuteMemberInConversationModal
                setShowModal={() => {
                    setShowMuteMemberModal(false);
                }} /> )}
			{showUnMuteMemberModal && (<UnMuteMemberInConversationModal
                setShowModal={() => {
                    setShowUnMuteMemberModal(false);
                }} /> )}
			{showUpgradeMemberModal && (<UpgradeMemberInConversationModal
                setShowModal={() => {
                    setShowUpgradeMemberModal(false);
                }} /> )}
			{showDowngradeMemberModal && (<DowngradeMemberInConversationModal
                setShowModal={() => {
                    setShowDowngradeMemberModal(false);
                }} /> )}
			{showBanUserModal && (<BanUserFromConversationModal
                setShowModal={() => {
                    setShowBanUserModal(false);
                }} /> )}
			{showAllowUserModal && (<AllowMemberInConversationModal
                setShowModal={() => {
                    setShowAllowUserModal(false);
                }} /> )}
			<MessageContainerHeaderStyle>
				<div className="messagePanelTitle">
					{conversationName}
				</div>
				<div className="convMenu">
				<OutsideClickHandler onOutsideClick={handleOutsideClick}>
					{user ? (
						<>
								<div onClick={toggleDropdown} className="profile-name"> <HamburgerIcon />
							{isDropdownOpen && ( <div className="dropdown-menu">
									<button className="convMenuButton" onClick={() => setShowAddMemberModal(true)}>Add Member</button>
									<button className="convMenuButton" onClick={() => setShowRemoveMemberModal(true)}>Remove Member</button>
									<button className="convMenuButton" onClick={() => setShowMuteMemberModal(true)}>Mute Member</button>
									<button className="convMenuButton" onClick={() => setShowUnMuteMemberModal(true)}>Unmute Member</button>
									<button className="convMenuButton" onClick={() => setShowUpgradeMemberModal(true)}>Upgrade Member to Admin</button>
									<button className="convMenuButton" onClick={() => setShowDowngradeMemberModal(true)}>Downgrade Admin to Member</button>
									<button className="convMenuButton" onClick={() => setShowBanUserModal(true)}>Ban User</button>
									<button className="convMenuButton" onClick={() => setShowAllowUserModal(true)}>Unbanned User</button>
									
									<div className="privacy-toggle">
										<button
										className={`toggle-button ${isPrivate ? 'private' : 'public'}`}
										onClick={handleTogglePrivacy}
										>
										{isPrivate ? 'Private Conversation' : 'Public Conversation'}
										</button>
									</div>
									
									{isOwner && (<button className="convMenuButton" onClick={() => setShowAllowUserModal(true)}> <LockIcon /> </button>)}
								</div>
							)}
							</div>
						</>
					) : (
						<button onClick={() => navigate('/login')}>SIGN IN</button>
					)}
				</OutsideClickHandler>
				</div>
			</MessageContainerHeaderStyle>
		</>
	);
}
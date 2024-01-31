import styled, { css } from 'styled-components';
import { PageProps } from '../../utils/styles/styleType';
import React, { MouseEvent, useState } from 'react';

export const Friendspage = styled.div`
  width: 100%;
  background-image: url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8NXx8fGVufDB8fHx8fA%3D%3D');
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const MainContentContainer = styled.div`
  display: flex;
`;

export const FriendsListContainer = styled.div`
  width: 150%;
  height: 500px;
  background-color: rgba(39, 39, 39, 0.7);
  margin-left: -80%;
  border-radius: 8px;
  overflow-y: auto; /* SCROLLBAR */
  
  &::-webkit-scrollbar {
    width: 2px; /* Adjust the width as needed */
  }
  &::-webkit-scrollbar-thumb {
    background-color: transparent; /* Make the thumb transparent */
    border: 1px solid #000; /* Thin black line around the thumb */
  }
`;

export const FriendsListTitle = styled.div`
  background-color: rgba(39, 39, 39, 0.7);
  color: white;
  padding: 10px;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 20px;
  font-weight: bold;
`;

const FriendItemContainer = styled.div`
  padding: 30px;
  border-bottom: 1px solid #111;
  color: white;
  display: flex;
  align-items: center;
  background-color: #4e4747;
  position: relative;
`;

const ContextMenuButton = styled.button`
  position: absolute;
  top: 4px;
  right: 10px;
  background-color: rgba(255, 0, 0, 0.5); /* Red with 50% transparency */
  color: white;
  border: none;
  padding: 5px;
  cursor: pointer;
`;

const BlueCircle = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: blue;
  margin-right: 30px;
`;

const StatusCircle = styled.div`
  width: 15px;
  height: 15px;
  border-radius: 50%;
  margin-left: auto;
`;

const Username = styled.div`
  font-size: 20px; /* Adjust the font size as needed */
`;

interface FriendItemProps {
  friend: {
    id: number;
    username: string;
    status: string;
  };
  removeFriend: (friendId: number) => void;
}

export const FriendItem: React.FC<FriendItemProps> = ({ friend, removeFriend }) => {
  const { id, username, status } = friend;
  const [showDeleteButton, setShowDeleteButton] = useState(false);

  const handleMouseEnter = () => {
    setShowDeleteButton(true);
  };

  const handleMouseLeave = () => {
    setShowDeleteButton(false);
  };

  const handleRemoveFriend = () => {
    removeFriend(id);
    setShowDeleteButton(false);
  };

  return (
    <FriendItemContainer
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}>
      <BlueCircle />
      <Username>{username}</Username>
      {showDeleteButton && (
        <ContextMenuButton onClick={handleRemoveFriend}>Remove from friends</ContextMenuButton>
      )}
      <StatusCircle style={{ backgroundColor: status === 'ONLINE' ? 'green' : 'red' }} />
    </FriendItemContainer>
  );
};

//////////////////////////////////////////////////////////////
				///////// INVITATION /////////
//////////////////////////////////////////////////////////////


export const InvitationContainer = styled.div`
  display: flex;
  flex-direction: column; 
  width: 40%; 
  margin-left: 30px; 
`;


///////// INVITATION BAR /////////

export const InvitationBarContainer = styled.div`
  width: 130%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px;
  background-color: rgba(169, 169, 169, 0.5); /* Grey transparent 50% */
  margin-left: 100px;
  margin-right: -100px;
`;

const Input = styled.input`
  margin-right: 10px;
  padding: 5px;
  ${({ maxLength }) =>
    maxLength &&
    css`
      max-length: ${maxLength};
    `}
`;

const Message = styled.div`
  margin-right: auto;
  color: white;
`;

export const SendButton = styled.button`
  height: 20%;  
  background-color: #222;
  color: white;
  margin-top: 5px;
  border: none;
  padding: 10px 10px;
  cursor: pointer;
`;

interface InvitationBarProps {
  sendInvitation: (invitationDetails: { usernameOrEmail: string }) => void;
}

export const InvitationBar: React.FC<InvitationBarProps> = ({ sendInvitation }) => {
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    setMessage('');
  };

  const handleSendInvitation = () => {
    if (inputValue.trim() === '') {
      setMessage('Please enter the username or email.');
    } if (inputValue.length > 10) {
      setMessage('Input exceeds the maximum character limit.');
    } else {
      sendInvitation({ usernameOrEmail: inputValue });
      setInputValue('');
      setMessage('');
    }
  };

  return (
	<div>
	  <Input maxLength={30}
		type="text"
		placeholder="Username or Email"
		value={inputValue}
		onChange={handleInputChange}
	  />
	  <Message>{message}</Message>
	  <SendButton onClick={handleSendInvitation}>Send Invitation</SendButton>
	</div>
  );
};

///////// INVITATION LIST /////////


export const InvitationsListContainer = styled.div`
width: 200%;
height: 350px;
background-color: rgba(69, 69, 69, 0.5);;
border-radius: 8px;
overflow-y: auto; /* SCROLLBAR */
margin-left: 100px;
margin-right: -100px;
margin-top: 30px;

&::-webkit-scrollbar {
	width: 2px; /* Adjust the width as needed */
}
&::-webkit-scrollbar-thumb {
	background-color: transparent; /* Make the thumb transparent */
    border: 1px solid #000; /* Thin black line around the thumb */
}
`;

const InvitationItemContainer = styled.div`
  padding: 10px;
  border-bottom: 1px solid #111;
  color: white;
  display: flex;
  align-items: center;
  background-color: #4e4747;
  position: relative;
`;

const ActionButton = styled.button`
  border: none;
  color: white;
  margin-left: 10px;
  padding: 10px;
  cursor: pointer;
  position: relative;
`;

const AcceptButton = styled(ActionButton)`
  background-color: #24703b;
  margin-left: 90px;
  &:before {
    content: '✔';
  }
`;

const RefuseButton = styled(ActionButton)`
  background-color: #ad2929;
  &:before {
    content: '✖';
  }
`;

const invitUsername = styled.div`
  font-size: 20px; /* Adjust the font size as needed */
`;

interface InvitationItemProps {
	invitation: {
	  id: number;
	  username: string;
	};
	acceptInvitation: (invitationId: number) => void;
	refuseInvitation: (invitationId: number) => void;
  }
  
  export const InvitationItem: React.FC<InvitationItemProps> = ({ invitation, acceptInvitation, refuseInvitation }) => {
	const { id, username } = invitation;

	const handleRefuseInvitation = () => {
		refuseInvitation(id);
	};

	const handleAcceptInvitation = () => {
		acceptInvitation(id);
	};
  
	return (
	  <InvitationItemContainer>
		<BlueCircle />
		<Username>{username}</Username>
		<AcceptButton onClick={handleAcceptInvitation} />
      	<RefuseButton onClick={handleRefuseInvitation} />
	  </InvitationItemContainer>
	);
  };
  
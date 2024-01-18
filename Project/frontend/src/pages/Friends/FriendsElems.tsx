import styled from 'styled-components';
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

export const FriendsListContainer = styled.div`
  width: 40%;
  height: 70%;
  background-color: #3d3434;
  margin-left: -40%;
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
  background-color: #333;
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
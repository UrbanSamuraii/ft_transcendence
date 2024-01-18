import { Outlet } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useEffect, useState, useContext } from 'react';
import { Friendspage, MainContentContainer, InvitationBarContainer, FriendsListContainer, FriendsListTitle, FriendItem, InvitationBar} from './FriendsElems';
import { useSocket } from '../../SocketContext';
import { getFriendsList } from '../../utils/hooks/getFriendsList';


export const FriendsPage = () => {

    const chatSocketContextData = useSocket();
    const [friendsList, setFriendsList] = useState<any[]>([]);

    useEffect(() => {
        const fetchFriendsList = async () => {
            console.log("FriendsPage WORKING ON");
            try {
                const friendsList = await getFriendsList();
                console.log("Fetched Friends List: ", friendsList);
                setFriendsList(friendsList);
            } catch (error) {
                console.error('Error fetching friends list:', error);
            }
        };
        fetchFriendsList();

        const socket = chatSocketContextData?.socket;
        if (socket) { socket.on('changeInFriendship', fetchFriendsList) }
        return () => {
            if (socket) { socket.off('changeInFriendship', fetchFriendsList) }
        };
    }, [chatSocketContextData]);

    const handleRemoveFriend = async (friendId: number) => {
        try {
          const removed_friend = await axios.post('http://localhost:3001/users/remove_friend', { friendId: friendId }, {
            withCredentials: true });
        } catch (error) {
          console.error('Error removing friend:', error);
        }
    };

    const handleSendInvitation = async (invitationDetails: { usernameOrEmail: string }) => {
        try {
            const removed_friend = await axios.post('http://localhost:3001/users/send_invitation', { userName: invitationDetails.usernameOrEmail }, {
              withCredentials: true });
        } catch (error) {
            console.error('Error inviting friend:', error);
        }
    };
    

    return (
        <Friendspage>
            <MainContentContainer>
                <FriendsListContainer>
                    <FriendsListTitle>Friends</FriendsListTitle>
                    <div>
                        {friendsList.map((friend) => (
                        <FriendItem
                            key={friend.id}
                            friend={{ id: friend.id, username: friend.username, status: friend.status }}
                            removeFriend={handleRemoveFriend}
                        />
                        ))}
                    </div>
                </FriendsListContainer>
                <InvitationBarContainer>
                    <InvitationBar sendInvitation={handleSendInvitation} />
                </InvitationBarContainer>
            </MainContentContainer>
        </Friendspage>
    );
};
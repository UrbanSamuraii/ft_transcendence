import axios from 'axios';
import  { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Friendspage, MainContentContainer, InvitationContainer, InvitationsListContainer, InvitationBarContainer, FriendsListContainer, FriendsListTitle, FriendItem, InvitationItem, InvitationBar } from './FriendsElems';
import { useSocket } from '../../SocketContext';
import { getFriendsList } from '../../utils/hooks/getFriendsList';
import { getInvitationsList } from '../../utils/hooks/getInvitationsList';
import DOMPurify from 'dompurify';
import { ErrorMessageModal } from '../../components/modals/ErrorMessageModal';

export const FriendsPage = () => {

    const chatSocketContextData = useSocket();
    const [friendsList, setFriendsList] = useState<any[]>([]);
    const [invitationsList, setInvitationsList] = useState<any[]>([]);

    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
    const [customError, setCustomError] = useState<string>('');
    const [showModalError, setShowModalError] = useState<boolean>(false);
    
    const handleCustomAlertClose = () => {
        setCustomError('');
    };

    const handleShowModalError = () => {
    setShowModalError(true);
    };

    const handleCloseModalError = () => {
    setShowModalError(false);
    };

    useEffect(() => {
        const fetchFriendsList = async () => {
            try {
                const friendsList = await getFriendsList();
                console.log("Fetched Friends List: ", friendsList);
                setFriendsList(friendsList);
            } catch (error) {
                console.error('Error fetching friends list:', error);
            }
        };

        const fetchInvitationsList = async () => {
            try {
                const invitationsList = await getInvitationsList();
                console.log("Fetched Invitations List: ", invitationsList);
                setInvitationsList(invitationsList);
            } catch (error) {
                console.error('Error fetching invitations list:', error);
            }
        };

        fetchFriendsList();
        fetchInvitationsList();

        const socket = chatSocketContextData?.socket;
        if (socket) {
            socket.on('changeInFriendship', fetchFriendsList);
            socket.on('changeInFriendship', fetchInvitationsList);
        }
        return () => {
            if (socket) {
                socket.off('changeInFriendship', fetchFriendsList);
                socket.off('changeInFriendship', fetchInvitationsList);
            }
        };

    }, [chatSocketContextData]);

    const handleRemoveFriend = async (friendId: number) => {
        try {
            const removed_friend = await axios.post(`http://${process.env.REACT_APP_SERVER_ADRESS}:3001/users/remove_friend`, { friendId: friendId }, {
                withCredentials: true
            });
        } catch (error: any) {
            const err = error as AxiosError;
            if (axios.isAxiosError(error)) {
                console.log(err.response);
                if (error.response && error.response.data) {
                    if (error.response.data.message) { 
                        const receivedCustomError: string = error.response.data.message;
                        setCustomError(receivedCustomError);}
                    else { 
                        const receivedCustomError: string = error.response.data.error; 
                        setCustomError(receivedCustomError);}
                    handleShowModalError();
                }
            }
        }
    };

    const handleSendInvitation = async (invitationDetails: { usernameOrEmail: string }) => {
        try {
            const invitation = await axios.post(`http://${process.env.REACT_APP_SERVER_ADRESS}:3001/users/send_invitation`, { userName: DOMPurify.sanitize(invitationDetails.usernameOrEmail) }, {
                withCredentials: true
            });
        } catch (error: any) {
            const err = error as AxiosError;
            if (axios.isAxiosError(error)) {
                console.log(err.response);
                if (error.response && error.response.data) {
                    if (error.response.data.message) { 
                        const receivedCustomError: string = error.response.data.message;
                        setCustomError(receivedCustomError);}
                    else { 
                        const receivedCustomError: string = error.response.data.error; 
                        setCustomError(receivedCustomError);}
                    handleShowModalError();
                }
            }
        }
    };

    const handleAcceptInvitation = async (invitationId: number) => {
        console.log("Invitation from id USER :", invitationId);
        try {
            const added_friend = await axios.post(`http://${process.env.REACT_APP_SERVER_ADRESS}:3001/users/add_friend`, { invitationId: invitationId }, {
                withCredentials: true
            });
        } catch (error: any) {
            const err = error as AxiosError;
            if (axios.isAxiosError(error)) {
                console.log(err.response);
                if (error.response && error.response.data) {
                    if (error.response.data.message) { 
                        const receivedCustomError: string = error.response.data.message;
                        setCustomError(receivedCustomError);}
                    else { 
                        const receivedCustomError: string = error.response.data.error; 
                        setCustomError(receivedCustomError);}
                    handleShowModalError();
                }
            }
        }
    };

    const handleRefuseInvitation = async (invitationId: number) => {
        try {
            const refused_friend = await axios.post(`http://${process.env.REACT_APP_SERVER_ADRESS}:3001/users/refuse_invitation`, { invitationId: invitationId }, {
                withCredentials: true
            });
        } catch (error: any) {
            const err = error as AxiosError;
            if (axios.isAxiosError(error)) {
                console.log(err.response);
                if (error.response && error.response.data) {
                    if (error.response.data.message) { 
                        const receivedCustomError: string = error.response.data.message;
                        setCustomError(receivedCustomError);}
                    else { 
                        const receivedCustomError: string = error.response.data.error; 
                        setCustomError(receivedCustomError);}
                    handleShowModalError();
                }
            }
        }
    };


    return (
        <>
        {customError && showModalError && <ErrorMessageModal setShowModalError={handleCloseModalError} errorMessage={customError} />}
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
                <InvitationContainer>
                    <InvitationBarContainer>
                        <InvitationBar sendInvitation={handleSendInvitation} />
                    </InvitationBarContainer>
                    <InvitationsListContainer>
                        <FriendsListTitle>Invitations</FriendsListTitle>
                        <div>
                            {invitationsList.map((invitation) => (
                                <InvitationItem
                                    key={invitation.id}
                                    invitation={{ id: invitation.id, username: invitation.username }}
                                    acceptInvitation={handleAcceptInvitation}
                                    refuseInvitation={handleRefuseInvitation}
                                />
                            ))}
                        </div>
                    </InvitationsListContainer>
                </InvitationContainer>
            </MainContentContainer>
        </Friendspage>
        </>
    );
};
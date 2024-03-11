import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import '../conversations/GlobalConversations.css';
import axios from 'axios';
import { useSocket } from '../../SocketContext';

const server_adress = process.env.REACT_APP_SERVER_ADRESS;

type Member = {
    username: string;
};

type MemberInConversationFormProps = {
    setShowModal: (show: boolean) => void;
};

export const GoToProfileForm: React.FC<MemberInConversationFormProps> = ({ setShowModal }) => {
    const [memberList, setMemberList] = useState<Member[]>([]);
    const conversationId = useParams().id;
    const { socket } = useSocket();
    const navigate = useNavigate(); // Access to navigate function

    useEffect(() => {
        const fetchMemberList = async () => {
            try {
                console.log("Fetching members list");
                const response = await axios.get(`http://${server_adress}:3001/conversations/${conversationId}/members`, {
                    withCredentials: true,
                });
                setMemberList(response.data);
            } catch (error) {
                console.error('Error fetching member list:', error);
            }
        };

        fetchMemberList();

        socket?.on('onConvChange', fetchMemberList);
        return () => {
            socket?.off('onConvChange', fetchMemberList);
        };
    }, [socket]);

    const goToUserProfile = (username: string) => {
        navigate(`/@/${username}`);
    };

    return (
        <div className="member-list-container">
            <h2>Member List</h2>
            {memberList.length > 0 ? (
            <div className="member-list">
                <ul>
                    {memberList.map((member) => (
                        <li key={member.username}>
                            <button
                                className="username-button"
                                onClick={() => goToUserProfile(member.username)}
                            >
                                {member.username}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        ) : (
            <p>This chat is as empty as your soul.</p>
        )}
        </div>
    );
};

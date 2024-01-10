import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { useSocket } from '../../SocketContext';

type Member = {
  username: string;
};

type MemberInConversationFormProps = {
  setShowModal: (show: boolean) => void;
};

export const DowngradeMemberInConversationForm: React.FC<MemberInConversationFormProps> = ({ setShowModal }) => {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const conversationId = useParams().id;
  const { socket } = useSocket();

  useEffect(() => {
    const fetchMemberList = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/conversations/${conversationId}/admin_members`, {
			  withCredentials: true,
		  });
		  setMemberList(response.data);
      } catch (error) {
        console.error('Error fetching member list:', error);
      }
    };

    fetchMemberList();

    socket?.on('onDowngradeAdminStatus', fetchMemberList);
	  return () => {
		  socket?.off('onDowngradeAdminStatus', fetchMemberList);
  }; 
  }, [socket]);

  const downgradeAdminToMember = async (username: string) => {
    try {
		await axios.post(`http://localhost:3001/conversations/${conversationId}/downgrade_admin_to_member`,
		{ adminToDowngrade: username }, 
		{ withCredentials: true });
    } catch (error) {
      console.error('Error upgrading member to admin:', error);
      
    }
  };

  return (
    <div className="member-list-container">
      <h2>Member List</h2>
      <div className="member-list">
        <ul>
          {memberList.map((member) => (
            <li key={member.username}>
              <button
                className="username-button"
                onClick={() => downgradeAdminToMember(member.username)}
              >
                {member.username}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';

type Member = {
  username: string;
};

type MemberInConversationFormProps = {
  setShowModal: (show: boolean) => void;
};

export const UpgradeMemberInConversationForm: React.FC<MemberInConversationFormProps> = ({ setShowModal }) => {
  const [memberList, setMemberList] = useState<Member[]>([]);
  const conversationId = useParams().id;

  useEffect(() => {
    const fetchMemberList = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/conversations/${conversationId}/members`, {
			  withCredentials: true,
		  });
        // console.log({"MEMBER LIST in the conversation": response});
		  setMemberList(response.data);
      } catch (error) {
        console.error('Error fetching member list:', error);
      }
    };

    fetchMemberList();
  }, []);

  const upgradeMemberToAdmin = async (username: string) => {
    try {
      await axios.post(`http://localhost:3001/conversations/${conversationId}/update_member_to_admin`,
		{ userToUnmute: username }, 
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
                onClick={() => upgradeMemberToAdmin(member.username)}
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

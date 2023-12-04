import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import '../conversations/GlobalConversations.css'
import axios from 'axios';

type Member = {
	username: string;
  };
  
  type MemberInConversationFormProps = {
	setShowModal: (show: boolean) => void;
  };
  
  export const AllowMemberInConversationForm: React.FC<MemberInConversationFormProps> = ({ setShowModal }) => {
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
  
	const allowMember = async (username: string) => {
	  try {
	    const response = await axios.post(`http://localhost:3001/conversations/${conversationId}/get_member_Allow`, 
		{ userToUnmute: username }, 
		{ withCredentials: true });
		console.log("USER SELECTED ", response)
	  } catch (error: any) {
		if (error.response && error.response.status === 403) {
			alert("Unauthorized: Please log in.");
		  } else if (error.response && error.response.data && error.response.data.message) {
			alert(error.response.data.message);
		  } else {
			console.error('Error un-muting member:', error);
	  }
	};};
  
	return (
	  <div className="member-list-container">
		<h2>Member List</h2>
		<div className="member-list">
		  <ul>
			{memberList.map((member) => (
			  <li key={member.username}>
				<button
				  className="username-button"
				  onClick={() => allowMember(member.username)}
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
import axios, { AxiosRequestConfig } from 'axios';

export async function getConversationsIdentified(id: any) {
	try {
	  const API_URL = 'http://localhost:3001/messages';
	  const config: AxiosRequestConfig = { withCredentials: true };
  
	  const response = await axios.get(`${API_URL}/${id}`, config);
	//   console.log({"RESPONSE FROM AXIOS.GET": response.data});
	  return response.data;
	} catch (error) {
	  console.error('Error getting messages from the conversation:', error);
	  return { messages: [] }; // Return an empty array in case of an error
	}
}
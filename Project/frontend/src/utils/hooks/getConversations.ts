import { useEffect, useState } from "react";
import axios from 'axios';

export function getConversations() {
  const [conversations, setConversations] = useState([]);

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    axios.get(`${API_URL}/conversations`)
      .then(({ data }) => {
        setConversations(data);
      })
      .catch((err) => {
        console.error('Error fetching conversations:', err);
      });
  }, []);

  return { conversations };
}

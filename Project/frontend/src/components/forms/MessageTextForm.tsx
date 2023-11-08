import React, { useState } from 'react';
import axios from 'axios';
import { MessageInputFieldProps } from '../messages/MessageInputField';
import './GlobalForms.css'; // Import your CSS file

interface FormMessageTextData {
  content: string;
}

export const MessageInputTextForm = ({ conversationId }: MessageInputFieldProps) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);
      await axios.post('http://localhost:3001/messages', { content, conversationId }, {
        withCredentials: true,
      });
      setContent('');
    } catch (error) {
      console.error('Sending message error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          const customError = error.response.data.error;
          if (customError) {
            alert(`Error: ${customError}`);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        id="message-input"
        rows={3}
        placeholder="Type your message..."
        spellCheck={false}
        className="MessageInputTextArea"
        value={content}
        onChange={handleInputChange}
      />
      <button type="submit" disabled={loading} className="MessageSendButton">
        <span className="MessageSendIcon">📨</span>
      </button>
    </form>
  );
};

export default MessageInputTextForm;
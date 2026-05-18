import { Bot } from 'lucide-react';
import ChatMessage from '../ChatMessage/ChatMessage';
import styles from './MessageList.module.css';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function MessageList() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`);
      // console.log(response.data.data);
      setConversations(response.data.data);
      console.log(conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className={styles.messageList}>
      {conversations.length === 0 ? (
        <div className={styles.empty}>What are you working on?</div>
      ) : (
        conversations.map((conversation) => (
          <div key={conversation.id}>{conversation.content}</div>
        ))
      )}

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingAvatar}>
            <Bot size={18} color="white" />
          </div>
          <div className={styles.loading}>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
            <div className={styles.loadingDot}></div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}

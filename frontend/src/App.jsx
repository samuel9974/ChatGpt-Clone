import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar/Sidebar';
import ChatHeader from './components/ChatHeader/ChatHeader';
import MessageList from './components/MessageList/MessageList';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  /**
   * Fetches the conversations from the API.
   */
  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/conversations`);
      if (response.data.status) {
        setConversations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

/**
 * Scrolls to the bottom of the message list when the conversations or loading state changes.
 * @param {Array} conversations - The array of conversations to scroll to.
 * @param {boolean} isLoading - Whether the loading state is true.
 */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, isLoading]);


  /**
   * Handles the sending of a message to the API.
   * @param {string} question - The question to send to the API.
   */
  const handleSendMessage = async (question) => {
    const tempUserMessage = {
      id: Date.now(),
      role: 'user',
      content: question.trim(),
    };
    setConversations((prev) => [...prev, tempUserMessage]);
    
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/chat/conversations`, {question: question.trim()});
      if (response.data.status) {
        setConversations((prev) => [...prev, response.data.assistantAnswer]);
      }
    } catch (error) {
      console.error('Error posting conversation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <main className="chat">
        <ChatHeader />

        <MessageList
          conversations={conversations}
          isLoading={isLoading}
          messagesEndRef={messagesEndRef}
        />

        <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;

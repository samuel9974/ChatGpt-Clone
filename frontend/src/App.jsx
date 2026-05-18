import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar/Sidebar";
import ChatHeader from "./components/ChatHeader/ChatHeader";
import MessageList from "./components/MessageList/MessageList";
import ChatInput from "./components/ChatInput/ChatInput";
import "./App.css";

const API_BASE_URL = "http://localhost:5000/api";

function App() {
  
  return (
    <div className="app">
      <Sidebar />

      <main className="chat">
        <ChatHeader />

        <MessageList />

        {/* <ChatInput
          handleSendMessage={handleSendMessage}
          isLoading={isLoading}
        /> */}
      </main>
    </div>
  );
}

export default App;

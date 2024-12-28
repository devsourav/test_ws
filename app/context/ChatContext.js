"use client";

import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState('normal');

  return (
    <ChatContext.Provider value={{ 
      messages, setMessages,
      isRecording, setIsRecording,
      recordingMode, setRecordingMode 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
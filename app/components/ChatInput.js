"use client";

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useWebSocket } from '../context/WebSocketContext';

export const ChatInput = () => {
  const [input, setInput] = useState('');
  const { messages, setMessages } = useChat();
  const { sendMessage } = useWebSocket();


  const handleSend = () => {
    if (!input.trim()) return;
    
    const message = { type: 'text', text: input };
    sendMessage(message);
    
    setMessages([...messages, { sender: 'user', content: input }]);
    setInput('');
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex space-x-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-lg border border-gray-300 p-2 text-black focus:outline-none focus:ring-1 focus:ring-green-500"
          rows={1}
        />
        <button
          onClick={handleSend}
          className="p-2 rounded-lg border bg-green-500 text-white"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};
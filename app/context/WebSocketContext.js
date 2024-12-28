import { createContext, useContext, useEffect, useRef } from 'react';
import { useChat } from './ChatContext';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  const ws = useRef(null);
  const { setMessages } = useChat();

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000');
    
    ws.current.onopen = () => console.log('WebSocket Connected');
    ws.current.onclose = () => console.log('WebSocket Disconnected');


      ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received message data:', data);
      setMessages(prev => [...prev, {
        sender: data.sender,
        content: data.content
      }]);
    };
    return () => ws.current?.close();
  }, [setMessages]);

  const sendMessage = (message) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  return (
    <WebSocketContext.Provider value={{ ws: ws.current, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
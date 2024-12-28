"use client";

import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { MediaControls } from "./MediaControls";
import { ChatProvider } from "../context/ChatContext";
import { WebSocketProvider } from "../context/WebSocketContext";

export const ChatLayout = () => {
  return (
    <ChatProvider>
      <WebSocketProvider>
        <div className="fixed bottom-5 right-5 w-96 bg-white rounded-lg shadow-lg">
          <div className="flex flex-col h-[600px]">
            <MessageList />
            <MediaControls />
            <ChatInput />
          </div>
        </div>
      </WebSocketProvider>
    </ChatProvider>
  );
};

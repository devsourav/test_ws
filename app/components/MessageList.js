import { useChat } from "../context/ChatContext";

export const MessageList = () => {
  const { messages } = useChat();

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${
            msg.sender === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[80%] flex flex-col rounded-lg p-3 ${
              msg.sender === "user"
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {msg.sender === "user" ? (
              <span className="font-bold">You</span>
            ) : (
              <span className="font-bold">{msg.sender}</span>
            )}
            <span>{msg.content}</span>
            <span>{msg.type}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

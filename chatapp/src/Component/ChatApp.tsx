import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  text: string;
  id: (string | undefined);
}

// Create socket instance (typed as Socket)
const socket: Socket = io("http://localhost:3000");

function ChatApp() {
  const [message, setMessage] = useState<string>("");
  const [chat, setChat] = useState<Message[]>([]);

   const [roomId, setRoomId] = useState<string>("");

  const handleCreateRoom = () => {
    if (!roomId.trim()) {
      alert("Please enter a Room ID!");
      return;
    }
    console.log("Room created with ID:", roomId);
    // Here you can call backend API or navigate to `/room/${roomId}`
  };

  useEffect(() => {
    // Listen for messages from server
    socket.on("receive_message", (data: Message) => {
      setChat((prev) => [...prev, data]);
    });

    // Cleanup
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;
    const newMessage: Message = { text: message, id: socket.id };
    socket.emit("send_message", newMessage);
    setMessage("");
  };

  return (
    <div className="p-5 flex flex-col items-center">
      <h1 className="text-2xl font-bold">💬 Chat App</h1>

      {/* Room Create */}
      <div className="flex items-center mt-7">
        <input
          type="text"
          placeholder="Enter the Room Id (create ... )"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleCreateRoom}
          className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
        >
          Create Room
        </button>
      </div>

      {/* Chat Box */}
      <div className="w-96 h-80 border rounded p-3 overflow-y-auto my-4 bg-gray-100">
        {chat.map((msg, index) => (
          <p
            key={index}
            className={`p-2 my-1 rounded ${msg.id === socket.id
                ? "bg-green-300 text-right"
                : "bg-blue-300 text-left"
              }`}
          >
            {msg.text}
          </p>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border px-3 py-2 rounded w-72"
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatApp;
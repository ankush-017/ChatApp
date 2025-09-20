import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  text: string;
  id: string | undefined;
  roomId: string;
}

interface Response {
  success: boolean;
  message: string;
}

const socket: Socket = io("http://localhost:3000");

function ChatApp() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<Message[]>([]);
  const [roomId, setRoomId] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");

  const handleCreateRoom = () => {
    if (!roomId.trim()) return alert("Enter a Room ID!");
    socket.emit("create_room", roomId);
    alert(`Room "${roomId}" created!`);
  };

  const handleJoinRoom = () => {
    if (!joinRoomId.trim()) return alert("Enter a Room ID!");
    socket.emit("join_room", joinRoomId, (response: Response) => {
      if (response.success) {
        setRoomId(joinRoomId);
        alert(`Joined room: ${joinRoomId}`);
      } else alert(response.message);
    });
  };

  useEffect(() => {
    socket.on("receive_message", (data: Message) => {
      setChat((prev) => [...prev, data]);
    });
    return () => {
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (!message.trim() || !roomId) return;
    const newMessage: Message = { text: message, id: socket.id, roomId };
    socket.emit("send_message", newMessage);
    setChat((prev) => [...prev, newMessage]);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-5">
      <h1 className="text-3xl font-extrabold text-blue-700 mb-6">💬 Chat App</h1>

      {/* Room Controls */}
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-xl mb-4">
        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Create Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={handleCreateRoom}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
          >
            Create
          </button>
        </div>

        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Join Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinRoom()}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
          />
          <button
            onClick={handleJoinRoom}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
          >
            Join
          </button>
        </div>
      </div>

      {/* Chat Box */}
      <div className="w-full max-w-xl flex-1 flex flex-col border border-gray-300 rounded-xl bg-white shadow-lg overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-gray-100">
          {chat.length === 0 && (
            <p className="text-gray-400 text-center mt-20">
              No messages yet. Start the chat!
            </p>
          )}
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.id === socket.id ? "justify-end" : "justify-start"} mb-2`}
            >
              <span
                className={`px-4 py-2 rounded-xl max-w-[70%] break-words ${
                  msg.id === socket.id
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-300 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div className="flex p-3 border-t border-gray-200 bg-gray-50">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatApp;
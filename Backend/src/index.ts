import express from 'express';
import {Server,Socket} from 'socket.io'
import http from 'http';
import cors from 'cors';
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://chatapp-iota-green.vercel.app"
    ],
    methods: ["GET", "POST"],
}));
app.use(express.json());

const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, { // WebSocket server setup over the existing HTTP server.
  cors: {
    origin: ["http://localhost:5173","https://chatapp-iota-green.vercel.app/"],
    methods: ["GET", "POST"],
  },
});

interface Message {
  text: string;
  id: string; // socket id of the sender
  roomId: string; // Room ID for room-based chat
}

// WebSocket connection handling
// io means All connected clients
// socket means single connected client

// When a client connects
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join a room
    socket.on(
    "join_room",
    (roomId: string, callback: (response: { success: boolean; message: string }) => void) => {
      if (!roomId) {
        callback({ success: false, message: "Room ID cannot be empty!" });
        return;
      }

      socket.join(roomId); // Join the room
      console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
      callback({ success: true, message: `Joined room ${roomId}` });
    }
  );


  // create a room
  socket.on("create_room", (roomId) => {
    socket.join(roomId);
    console.log(`Room created with ID: ${roomId} by user: ${socket.id}`);
  });

  // Listen for chat messages for room based chat
  socket.on("send_message", (data: Message) => {
    const { roomId, text } = data;
    console.log(`Message received in room ${roomId}:, text`);

    socket.to(roomId).emit("receive_message", data); // Send the exact message object
  });

  /* User for  Without Room anyOne access it*/

  // socket.on("send_message", (data) => {
  //   console.log("Message received:", data);

  //   // socket.emit("receive_message", data); // Send message back to the sender (echo)
  //   socket.broadcast.emit("receive_message", data); // Send message to everyone except the sender => useful for chat applications

  //   // io.emit("receive_message", data); // Send message to everyone (broadcast) including the sender
  // });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// This setup is not good for production becouse it does not handle multiple requests efficiently, when there are many clients connected
// it can lead to performance issues and dropped connections
// It is better to use a dedicated HTTP server like 'http' or 'https' module from Node.js

// const server = app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// })

// const io = new Server(server); // WebSocket server setup over the existing TCP server
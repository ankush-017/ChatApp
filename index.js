import express from 'express';
import {Server} from 'socket.io'
import http from 'http';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// WebSocket connection handling
// io means All connected clients
// socket means single connected client

// When a client connects
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Listen for chat messages
  socket.on("send_message", (data) => {
    console.log("Message received:", data);

    // Send message to everyone (broadcast)
    io.emit("receive_message", data);
  });

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
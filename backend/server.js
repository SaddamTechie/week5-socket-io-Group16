const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('node:path');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());

//const __dirname = path.resolve();
// Store connected users
const connectedUsers = new Map();

// Function to log all connected users
const logConnectedUsers = () => {
  console.log('Connected users:', Array.from(connectedUsers.values()));
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', ({ username, room }) => {
    connectedUsers.set(socket.id, { id: socket.id, username, online: true });
    socket.join(room);
    socket.username = username;
    socket.room = room;
    
    // Broadcast updated user list and join message
    io.to(room).emit('user_update', Array.from(connectedUsers.values()));
    io.to(room).emit('receive_message', {
      username: 'System',
      message: `${username} has joined the chat`,
      timestamp: new Date()
    });
    
    // Log all connected users after join
    logConnectedUsers();
  });

  socket.on('send_message', (message) => {
    if (socket.room) {
      const messageData = {
        username: socket.username,
        message,
        timestamp: new Date()
      };
      // Log the message to console
      console.log('Message sent:', {
        room: socket.room,
        username: socket.username,
        message: message,
        timestamp: messageData.timestamp.toISOString()
      });
      
      io.to(socket.room).emit('receive_message', messageData);
    }
  });

  socket.on('disconnect', () => {
    if (socket.username && socket.room) {
      connectedUsers.delete(socket.id);
      io.to(socket.room).emit('user_update', Array.from(connectedUsers.values()));
      io.to(socket.room).emit('receive_message', {
        username: 'System',
        message: `${socket.username} has left the chat`,
        timestamp: new Date()
      });
      // Log all connected users after disconnect
      logConnectedUsers();
    }
    console.log('User disconnected:', socket.id);
  });
});

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
    })
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
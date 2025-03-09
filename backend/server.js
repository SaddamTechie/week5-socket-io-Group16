const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Message = require('./models/Message');

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

const connectedUsers = new Map();

const logConnectedUsers = () => {
  console.log('Connected users:', Array.from(connectedUsers.values()));
};

// Connect to MongoDB
connectDB();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join', ({ username, room }) => {
    connectedUsers.set(socket.id, { id: socket.id, username, online: true });
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // Send join message only on initial join
    io.to(room).emit('receive_message', {
      username: 'System',
      message: `${username} has joined the chat`,
      timestamp: new Date()
    });

    io.to(room).emit('user_update', Array.from(connectedUsers.values()));
    logConnectedUsers();
  });

  // New event for room switching without join message
  socket.on('switch_room', ({ username, room }) => {
    socket.leave(socket.room); // Leave previous room
    socket.join(room);
    socket.room = room;
    connectedUsers.set(socket.id, { id: socket.id, username, online: true });
    io.to(room).emit('user_update', Array.from(connectedUsers.values()));
    logConnectedUsers();
  });

  socket.on('send_message', (message) => {
    if (socket.room) {
      const messageData = {
        username: socket.username,
        message,
        timestamp: new Date()
      };

      // Save message to MongoDB if it's not a system message
      if (socket.username !== 'System') {
        const newMessage = new Message({
          username: socket.username,
          message: message,
          room: socket.room,
          timestamp: messageData.timestamp,
        });
        newMessage.save();
      }

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
      logConnectedUsers();
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

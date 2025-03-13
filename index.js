const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Updated frontend URL
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // Store peer IDs for each room

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId, peerId) => {
    console.log(`User with peerId: ${peerId} joined room: ${roomId}`);

    if (!rooms[roomId]) {
      rooms[roomId] = new Set();
    }
    
    rooms[roomId].add(peerId);
    socket.join(roomId);

    // Notify others in the room about the new user
    socket.to(roomId).emit("user-connected", peerId);

    socket.on("disconnect", () => {
      console.log(`User ${peerId} disconnected`);
      
      if (rooms[roomId]) {
        rooms[roomId].delete(peerId);

        // Notify remaining users in the room
        socket.to(roomId).emit("user-disconnected", peerId);
        
        // Remove room if empty
        if (rooms[roomId].size === 0) {
          delete rooms[roomId];
        }
      }
    });
  });
});

server.listen(5000, () => {
  console.log("Server running on port 5000");
});

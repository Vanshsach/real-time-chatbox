require("dotenv").config();

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const Message = require("./models/Message");

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Test Route
app.get("/", (req, res) => {
  res.send("Socket.IO Server Running");
});

// Socket Connection
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Join Room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`${socket.id} joined room ${room}`);
  });

  // Fetch Previous Messages
  socket.on("get_messages", async (room) => {
    try {
      const messages = await Message.find({ room }).sort({
        createdAt: 1,
      });

      socket.emit("previous_messages", messages);
    } catch (err) {
      console.log(err);
    }
  });

  // Send Message
  socket.on("send_message", async (data) => {
    try {
      // Save message in MongoDB
      const newMessage = new Message(data);
      await newMessage.save();

      // Send message to everyone in the room (including sender)
      io.to(data.room).emit("receive_message", data);

      console.log("Message Saved");
    } catch (err) {
      console.log(err);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
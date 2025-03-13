const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://user1:ry3l1jwj1IJlM1fT@database.nkts1.mongodb.net/SaruData?retryWrites=true&w=majority&appName=Database', {
    dbName: 'SaruData',
}).then(() => {
    console.log("Connected to MongoDB successfully");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

const MessageSchema = new mongoose.Schema({
  user: String,
  message: String,
  targetUser: String, // Đảm bảo trường này được lưu
  timestamp: { type: Date, default: Date.now },
});
const Message = mongoose.model("consultants", MessageSchema);

const io = new Server(server, {
    cors: {
      origin: ["http://localhost:4200", "http://localhost:4002"],
      methods: ["GET", "POST"],
    },
});

const clients = new Map();

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("register", (userName) => {
    clients.set(userName, socket.id);
    console.log(`User ${userName} registered with socket ID: ${socket.id}`);
  });

  socket.on("sendMessage", async (data) => {
    console.log("📥 Tin nhắn nhận được:", data); // Kiểm tra dữ liệu nhận được
    
    // Kiểm tra xem targetUser có tồn tại không
    if (!data.targetUser) {
      console.error("Thiếu targetUser trong dữ liệu gửi đến server");
      return;
    }

    // Đảm bảo tất cả các trường được lưu vào MongoDB
    const newMessage = new Message({
      user: data.user,
      message: data.message,
      targetUser: data.targetUser,
      timestamp: Date.now(),
    });
    await newMessage.save();
    console.log("Đã lưu tin nhắn vào MongoDB:", newMessage); // Kiểm tra dữ liệu lưu vào MongoDB

    const targetSocketId = clients.get(data.targetUser);
    if (targetSocketId) {
      io.to(targetSocketId).emit("receiveMessage", {
        user: data.user,
        message: data.message,
        targetUser: data.targetUser,
      });
      console.log(`Đã gửi tin nhắn đến ${data.targetUser} (socket ID: ${targetSocketId})`);
    } else {
      console.log(`Không tìm thấy socket ID cho người dùng: ${data.targetUser}`);
    }
  });

  socket.on("disconnect", () => {
    for (const [userName, socketId] of clients.entries()) {
      if (socketId === socket.id) {
        clients.delete(userName);
        console.log(`User ${userName} disconnected`);
        break;
      }
    }
  });
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi lấy tin nhắn" });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
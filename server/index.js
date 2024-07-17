const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const server = http.createServer(app);
const { Server } = require("socket.io");
const leaveRoom = require("./utils/leave-room");
const { v4 } = require("uuid");

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const CHAT_BOT = "ChatBot";
let chatRoom = "";
let allUsers = [];

io.on("connection", (socket) => {
  console.log("User connected. ID: " + socket.id);

  socket.on("send_message", (data) => {
    const { user, roomId, message, __createdtime__ } = data;
    console.log("Message received: " + message);
    io.in(roomId).emit("receive_message", data);
  });

  socket.on("join_room", ({ user, roomId }) => {
    socket.join(roomId);

    let __createdtime__ = Date.now();

    // Send message to all users currently in the room, apart from the user that just joined
    socket.to(roomId).emit("app_message", {
      message: `${user.username} has joined the chat room`,
      user: {
        username: CHAT_BOT,
      },
      __createdtime__,
    });

    socket.emit("app_message", {
      message: `You joined the chat`,
      user: {
        username: CHAT_BOT,
      },
      __createdtime__,
    });

    chatRoom = roomId;
    allUsers.push({ id: socket.id, user, roomId });
    chatRoomUsers = allUsers.filter((user) => user.roomId === roomId);
    socket.to(roomId).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);
  });

  socket.on("create_room", ({ user }) => {
    const roomId = v4();
    const __createdtime__ = Date.now();

    socket.emit("room_created", {
      roomId,
      __createdtime__,
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from the chat");
    const user = allUsers.find((user) => user.id == socket.id);

    console.log({ allUsers, user, socketId: socket.id });
    if (user?.username) {
      allUsers = leaveRoom(socket.id, allUsers);
      socket.to(chatRoom).emit("chatroom_users", allUsers);
      socket.to(chatRoom).emit("receive_message", {
        message: `${user.username} has disconnected from the chat.`,
      });
    }
  });
});

server.listen(4000, () => {
  console.log("listening on *:3000");
});

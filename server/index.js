const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const server = http.createServer(app);
const { Server } = require("socket.io");
const leaveRoom = require("./utils/leave-room");

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const CHAT_BOT = "ChatBot"; // Add this
let chatRoom = ""; // E.g. javascript, node,...
let allUsers = []; // All users in current chat room

io.on("connection", (socket) => {
  //io listens on server connection
  console.log("User connected. ID: " + socket.id);

  socket.on("send_message", (data) => {
    const { user, room, message, __createdtime__ } = data;
    console.log("Message received: " + message);

    io.in(room).emit("receive_message", data);
  });

  socket.on("join_room", ({ username, room }) => {
    socket.join(room);

    let __createdtime__ = Date.now();

    // Send message to all users currently in the room, apart from the user that just joined
    socket.to(room).emit("receive_message", {
      message: `${username} has joined the chat room`,
      user: {
        username: CHAT_BOT,
      },
      __createdtime__,
    });

    socket.emit("receive_message", {
      message: `Welcome ${username}`,
      user: {
        username: CHAT_BOT,
      },
      __createdtime__,
    });

    chatRoom = room;
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);

    socket.to(room).emit("chatroom_users", chatRoomUsers);
    socket.emit("chatroom_users", chatRoomUsers);
  });
  

  socket.on("disconnect", () => {
    console.log("User disconnected from the chat");
    const user = allUsers.find((user) => user.id == socket.id);
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

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

const CHAT_BOT = "ChatBot"; // Add this
let chatRoom = ""; // E.g. javascript, node,...
let allUsers = []; // All users in current chat room

const joinRoom = (socket, user, roomId) => {
  console.log('joining room')
  socket.join(roomId);

  let __createdtime__ = Date.now();

  // Send message to all users currently in the room, apart from the user that just joined
  socket.to(roomId).emit("receive_message", {
    message: `${user.username} has joined the chat room`,
    user: {
      username: CHAT_BOT,
    },
    __createdtime__,
  });

  socket.emit("receive_message", {
    message: `Welcome ${user.username}`,
    user: {
      username: CHAT_BOT,
    },
    __createdtime__,
  });

  chatRoom = roomId;
  allUsers.push({ id: socket.id, user, roomId });
  chatRoomUsers = allUsers.filter((user) => user.room === roomId);

  socket.to(roomId).emit("chatroom_users", chatRoomUsers);
  socket.emit("chatroom_users", chatRoomUsers);
};

io.on("connection", (socket) => {
  //io listens on server connection
  console.log("User connected. ID: " + socket.id);

  socket.on("send_message", (data) => {
    const { user, roomId, message, __createdtime__ } = data;
    console.log("Message received: " + message);

    console.log({roomId, data})
    socket.emit("receive_message", data)
    io.to(roomId).emit("receive_message", data);
  });

  socket.on("join_room", ({ user, roomId }) => {
    joinRoom(socket, user, roomId)
  });

  socket.on("create_room", ({ user }) => {
    const roomId = v4();
    // joinRoom(socket, user, roomId)

    const __createdtime__ = Date.now()

    socket.emit("room_created", {
      roomId,
      __createdtime__,
    });
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

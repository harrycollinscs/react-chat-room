import { useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import "./App.css";
import ChatPage from "./components/pages/ChatPage";
import HomePage from "./components/pages/HomePage";
import JoinRoomPage from "./components/pages/JoinRoomPage";

const socket = io("ws://localhost:4000");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                username={username}
                setUsername={setUsername}
                room={room}
                setRoom={setRoom}
                socket={socket}
              />
            }
          />
          <Route
            path="/room/:roomId"
            element={
              username && room ? (
                <ChatPage username={username} room={room} socket={socket} />
              ) : (
                <JoinRoomPage
                  socket={socket}
                  setRoom={setRoom}
                  username={username}
                  setUsername={setUsername}
                />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

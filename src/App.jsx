import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/pages/HomePage";
import { io } from "socket.io-client";
import { useState } from "react";
import ChatPage from "./components/pages/ChatPage";

const socket = io("ws://localhost:4000");

function App() {
  const [username, setUsername] = useState(""); // Add this
  const [room, setRoom] = useState(""); // Add this

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
            path="/room"
            element={
              <ChatPage
                username={username} // Add this
                room={room} // Add this
                socket={socket} // Add this
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

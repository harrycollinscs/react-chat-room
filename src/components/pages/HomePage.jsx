import React, { useEffect } from "react";
import viteLogo from "/vite.svg";
import { useNavigate } from "react-router-dom";

const HomePage = ({ username, setUsername, room, setRoom, socket }) => {
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("room_created", ({ roomId, __createdtime__ }) => {
      navigate(`/room/${roomId}`);
    });

    // Remove event listener on component unmount
    return () => socket.off("room_created");
  }, [socket]);

  const handleJoinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { username, room });
      navigate("/room");
    }
  };

  const handleCreateRoom = () => {
    socket.emit("create_room", {
      user: {
        username,
        id: socket.id,
      },
    });
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <div>
        <input
          placeholder="Username..."
          onChange={(e) => setUsername(e.target.value)} // Add this
        />
      </div>
      <div>
        <input
          placeholder="Enter room name..."
          onChange={(e) => setRoom(e.target.value)} // Add this
        />
      </div>
      <div className="card">
        <button onClick={handleJoinRoom}>Join room</button>
      </div>
      <div className="card">
        <button onClick={handleCreateRoom}>Create a room</button>
      </div>
    </>
  );
};

export default HomePage;

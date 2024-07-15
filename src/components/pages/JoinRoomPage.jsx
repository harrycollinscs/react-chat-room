import React, { useState } from "react";
import { useParams } from "react-router-dom";

const JoinRoomPage = ({ socket, username, setUsername, setRoom }) => {
  const { roomId } = useParams();

  const handleJoinRoom = () => {
    if (username.length) {
      socket.emit("join_room", {
        user: {
          username: username,
          id: socket.id,
        },
        roomId: roomId
      });
      setRoom(roomId)
      navigate(`/room/${roomId}`);
    }
  };

  return (
    <>
      <div>
        <h3>To join this room, please enter a username</h3>
      </div>
      <div>
        <input
          placeholder="Username..."
          onChange={(e) => setUsername(e.target.value)} // Add this
        />
      </div>

      <div className="card">
        <button onClick={handleJoinRoom}>Join room</button>
      </div>
    </>
  );
};

export default JoinRoomPage;

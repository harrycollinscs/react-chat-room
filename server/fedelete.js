import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ChatPage = ({ username, room, socket }) => {
  const [inputValue, setInputValue] = useState(null);
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  // if (isLoading) return null

  const { roomId } = useParams();

  console.log({ socket });

  useEffect(() => {
    console.log('joining room')
    socket.emit("join_room", {
      user: {
        username: "test_username_todo",
        id: socket.id,
      },
      roomId,
    });
  }, [socket]);

  useEffect(() => {
    socket.on("receive_message", ({ message, user, __createdtime__ }) => {
      console.log("hi");
      setMessagesReceived((state) => [
        ...state,
        {
          message,
          user,
          __createdtime__,
        },
      ]);
    });

    // Remove event listener on component unmount
    return () => socket.off("receive_message");
  }, [socket]);

  useEffect(() => {
    socket.on("chatroom_users", (data) => {
      console.log(data);
      setRoomUsers(data);
    });

    return () => socket.off("chatroom_users");
  }, [socket]);

  useEffect(() => {
    socket.on("chatroom_users", (data) => {
      console.log(data);
      setRoomUsers(data);
    });

    return () => socket.off("chatroom_users");
  }, [socket]);

  const handleSendMessage = () => {
    if (inputValue?.length) {
      console.log("sending message");

      socket.emit("send_message", {
        user: {
          username: username.length ? username : "Unknown User",
          id: socket.id,
        },
        roomId,
        message: inputValue,
        __createdtime__: Date.now(),
      });
    }
  };

  return (
    <div>
      <div style={{ alignItems: "flex-start", padding: 20 }}>
        <h2 style={{ margin: 0 }}>{room}</h2>
        <ul
          style={{
            listStyleType: "none",
            padding: 0,
            flexDirection: "row",
            textAlign: "flex-start",
            margin: 0,
          }}
        >
          {roomUsers.map(({ username }, index) => (
            <li style={{ display: "inline-block" }}>
              <p>
                {index > 0 ? ", " : ""}
                {username}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ width: "100%", padding: 20 }}>
        <h2>Messages</h2>

        <div style={{ border: "1px solid white", borderRadius: 5 }}>
          {messagesReceived?.map(({ message, user }) => (
            <div
              style={{
                marginTop: 10,
                textAlign: socket.id === user.id ? "right" : "left",
              }}
            >
              <p>{user.username}</p>
              <div
                style={{
                  display: "inline-block",
                  background: "#a7a7a7",
                  borderRadius: 50,
                  alignContent: "center",
                }}
              >
                <p style={{ marginRight: 20, marginLeft: 20 }}>{message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <input
            type="text"
            placeholder="Type message here"
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <button onClick={handleSendMessage}>Send </button>
      </div>
    </div>
  );
};

export default ChatPage;

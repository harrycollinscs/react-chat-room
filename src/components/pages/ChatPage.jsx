import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const ChatPage = ({ username, room, socket }) => {
  const [inputValue, setInputValue] = useState(null);
  const [messagesReceived, setMessagesReceived] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const chatBottomRef = useRef();

  useEffect(() => {
    socket.on("receive_message", ({ message, user, __createdtime__ }) => {
      if (user.id === socket.id) {
        setInputValue("");
      }
      setMessagesReceived((state) => [
        ...state,
        {
          message,
          user,
          isAppMessage: false,
          __createdtime__,
        },
      ]);
      chatBottomRef.current?.scrollIntoView();
    });

    return () => socket.off("receive_message");
  }, [socket]);

  useEffect(() => {
    socket.on("app_message", ({ message, __createdtime__ }) => {
      setMessagesReceived((state) => [
        ...state,
        {
          message,
          isAppMessage: true,
          __createdtime__,
        },
      ]);
    });

    return () => socket.off("app_message");
  }, [socket]);

  useEffect(() => {
    socket.on("chatroom_users", (data) => {
      setRoomUsers(data);
    });

    return () => socket.off("chatroom_users");
  }, [socket]);

  useEffect(() => {
    socket.on("chatroom_users", (data) => {
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
        roomId: room,
        message: inputValue,
        __createdtime__: Date.now(),
      });
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Chat</h1>
      <div style={{ alignItems: "flex-start", padding: 20 }}>
        <strong style={{ margin: 0 }}>Members</strong>
        <ul
          style={{
            listStyleType: "none",
            padding: 0,
            flexDirection: "row",
            textAlign: "flex-start",
            margin: 0,
          }}
        >
          {roomUsers.map(({ user }, index) => (
            <li style={{ display: "inline-block" }}>
              <p>
                {index > 0 ? ", " : ""}
                {user.username}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ width: "100%", padding: 20 }}>
        <h2>Messages</h2>

        <div className="chat-container">
          {messagesReceived?.map(({ message, user, isAppMessage }, index) => (
            <>
              {isAppMessage ? (
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      border: "2px solid black",
                      display: "inline-block",
                      padding: "5px 10px",
                    }}
                  >
                    {message}
                  </p>
                </div>
              ) : (
                <div
                  className="user-message"
                  style={{
                    textAlign: socket.id === user.id ? "right" : "left",
                  }}
                >
                  <p className="username">{user.username}</p>
                  <p className="message-content">{message}</p>
                </div>
              )}
            </>
          ))}
          <div style={{ visibility: "hidden" }} ref={chatBottomRef} />
        </div>

        {/* <div className="card">
          <input
            className="text-input-old"
            type="text"
            placeholder="Type message here"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <button onClick={handleSendMessage}>Send </button> */}
      </div>
    </div>
  );
};

export default ChatPage;

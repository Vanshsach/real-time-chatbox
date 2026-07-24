import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./chat.css";

function Chat({ username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeout = useRef(null);

  // Load previous messages
  useEffect(() => {
    socket.emit("get_messages", room);

    socket.on("previous_messages", (messages) => {
      setMessageList(messages);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    socket.on("show_typing", (user) => {
      if (user !== username) {
        setTypingUser(user);
      }
    });

    socket.on("hide_typing", () => {
      setTypingUser("");
    });

    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
      socket.off("show_typing");
      socket.off("hide_typing");
    };
  }, [room, username]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messageList]);

  const sendMessage = () => {
    if (currentMessage.trim() === "") return;

    const messageData = {
      room,
      author: username,
      message: currentMessage,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("send_message", messageData);

    socket.emit("stop_typing", room);

    setCurrentMessage("");
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);

    socket.emit("typing", {
      room,
      username,
    });

    clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", room);
    }, 1000);
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Room : {room}</p>
      </div>

      <div className="chat-body">
        {messageList.map((msg, index) => (
          <div
            key={index}
            className={
              msg.author === username
                ? "message my-message"
                : "message"
            }
          >
            <strong>{msg.author}</strong>
            <p>{msg.message}</p>
            <small>{msg.time}</small>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      {typingUser && (
        <div className="typing-indicator">
          {typingUser} is typing...
        </div>
      )}

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          onChange={handleTyping}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
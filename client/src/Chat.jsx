import { useState, useEffect, useRef } from "react";
import socket from "./socket";
import "./chat.css";

function Chat({ username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const messagesEndRef = useRef(null);

  // Load previous messages and listen for new ones
  useEffect(() => {
    socket.emit("get_messages", room);

    socket.on("previous_messages", (messages) => {
      setMessageList(messages);
    });

    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => {
      socket.off("previous_messages");
      socket.off("receive_message");
    };
  }, [room]);

  // Auto scroll
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

    setCurrentMessage("");
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
            <span>{msg.time}</span>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Type a message..."
          onChange={(e) => setCurrentMessage(e.target.value)}
        />

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
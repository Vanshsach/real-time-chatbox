import { useState } from "react";
import socket from "./socket";
import Chat from "./Chat";
import "./chat.css";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h2>Realtime Chat App</h2>

          <input
            type="text"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="text"
            placeholder="Room ID"
            onChange={(e) => setRoom(e.target.value)}
          />

          <button onClick={joinRoom}>
            Join Chat
          </button>
        </div>
      ) : (
        <Chat username={username} room={room} />
      )}
    </div>
  );
}

export default App;
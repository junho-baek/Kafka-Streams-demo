import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:8000");
const VOTE_CANDIDATES = [
  "조요셉",
  "엄윤희",
  "이서현",
  "이건",
  "손재훈",
  "윤희찬",
  "김정인",
  "이재영",
  "백준호",
  "방준현",
];

function App() {
  const [chat, setChat] = useState([]);
  const [voteCounts, setVoteCounts] = useState(() =>
    Object.fromEntries(VOTE_CANDIDATES.map((name) => [name, 0]))
  );
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("chat", (data) => {
      const isCandidate = VOTE_CANDIDATES.includes(data);
      setChat((prev) => [
        ...prev,
        { type: "vote", content: data, notCandidate: !isCandidate },
      ]);
      if (isCandidate) {
        setVoteCounts((prev) => ({ ...prev, [data]: prev[data] + 1 }));
      }
    });
    return () => {
      socket.off("chat");
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const vote = (name) => {
    setChat((prev) => [...prev, { type: "user", content: name }]);
    socket.emit("send_msg", name);
  };

  return (
    <div className="chat-container">
      <div className="vote-dashboard">
        <h3>투표 집계</h3>
        <ul>
          {VOTE_CANDIDATES.map((name) => (
            <li key={name}>
              <span>{name}</span>: <span>{voteCounts[name]}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="chat-messages">
        {chat.map((item, idx) => (
          <p
            key={idx}
            className={`message ${item.type}${
              item.notCandidate ? " not-candidate" : ""
            }`}
          >
            {item.type === "vote" ? `투표 결과: ${item.content}` : item.content}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="vote-buttons">
        {VOTE_CANDIDATES.map((name) => (
          <button key={name} onClick={() => vote(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;

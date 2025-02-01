import { useKeycloak } from "@react-keycloak/web";
import "./App.css";
import { useEffect, useState } from "react";

interface Message {
  id: number;
  username: string;
  message: string;
  created_at: Date;
}

interface MessageFromServer {
  type: "message" | "ban" | "kick" | "login" | "users";
  payload: Message | string; // in case of type login, ban or kick - the user
}

function App() {
  const { keycloak, initialized } = useKeycloak();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      const ws = new WebSocket("ws://localhost:3001");
      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: "login",
            payload: keycloak.tokenParsed?.preferred_username,
          })
        );
      };
      ws.onmessage = (event) => {
        console.log("Received message:", event.data);
        const message: MessageFromServer = JSON.parse(event.data);
        if (message.type === "message") {
          console.log("Received message:", message);
          const payload = message.payload;
          setMessages((prevState) => {
            return [
              ...prevState,
              {
                ...(payload as Message),
                id: prevState.length + 1,
              },
            ];
          });
        } else if (message.type === "users") {
          setConnectedUsers(JSON.parse(message.payload as string));
          console.log(
            "Users connected:",
            JSON.parse(message.payload as string)
          );
        } else if (message.type === "kick" || message.type === "ban") {
          setConnectedUsers((prevUsers) =>
            prevUsers.filter((user) => user !== (message.payload as string))
          );
        }
      };
      setWs(ws);
    }
  }, [initialized, keycloak.authenticated]);

  // Show loading message until Keycloak is initialized
  if (!initialized) {
    return <h2>Loading...</h2>;
  }

  // Handle sending a new message
  const handleSend = () => {
    if (input.trim()) {
      const message = {
        id: -1,
        message: input.trim(),
        username: keycloak.tokenParsed?.preferred_username ?? "Anonymous",
        created_at: new Date(),
      };
      if (ws) {
        ws.send(JSON.stringify({ type: "message", payload: message }));
      }
      setMessages([...messages, message]);
      setInput("");
    }
  };

  const handleKick = (user: string) => {
    if (user === keycloak.tokenParsed?.preferred_username) {
      alert("You cannot kick yourself!");
      return;
    }
    ws?.send(JSON.stringify({ type: "kick", payload: user }));
  };

  const handleBan = (user: string) => {
    if (user === keycloak.tokenParsed?.preferred_username) {
      alert("You cannot ban yourself!");
      return;
    }
    ws?.send(JSON.stringify({ type: "ban", payload: user }));
  };

  return (
    <div className="appcontainer">
      <h1>Chatbox</h1>
      <div className="chatbox">
        <p>
          {connectedUsers.length} user(s) connected:
          <br />
          {connectedUsers.length &&
            connectedUsers.map((user, index) => (
              <div key={index} className="user">
                <span className="username-bold">{user}</span>
                <button onClick={() => handleKick(user)}>Kick</button>
                <button onClick={() => handleBan(user)}>Ban</button>
              </div>
            ))}
        </p>
        {messages.map((message) => (
          <div key={message.id} className="message">
            <p>
              <div className="messagetime">
                {new Date(message.created_at).toLocaleTimeString()}
              </div>
              <span className="username">{message.username}</span>:
              <span className="messagecontent">{message.message}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="inputcontainer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          placeholder="Type your message here..."
          className="input"
        />
        <button onClick={handleSend} className="sendbutton">
          Send
        </button>
      </div>
    </div>
  );
}

export default App;

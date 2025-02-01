import { WebSocketServer, WebSocket } from "ws";
import axios from "axios";

const port = 3001;
const REST_API_URL = process.env.REST_API_URL || "http://rest-api:3000";

interface Message {
  type: "message" | "ban" | "kick" | "login" | "users";
  payload: string | any; // username or message content
}

const usersConnected = new Map<WebSocket, string>();
const userSockets: { [key: string]: WebSocket } = {};

// Create WebSocket server
const wss = new WebSocketServer({ port }, () => {
  console.log(`WebSocket server is running on ws://localhost:${port}`);
});

// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("A client connected");

  // Listen for messages from the client
  ws.on("message", async (message) => {
    console.log("Received message:", message.toString());

    try {
      const parsedMessage: Message = JSON.parse(message.toString());

      if (parsedMessage.type === "login") {
        handleLogin(ws, parsedMessage.payload);
        return;
      }

      if (parsedMessage.type === "kick" || parsedMessage.type === "ban") {
        await handleUserAction(parsedMessage.type, parsedMessage.payload);
        return;
      }

      // Broadcast message to other clients
      broadcastMessage(ws, parsedMessage);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    const username = usersConnected.get(ws);
    console.log(`Client ${username} disconnected`);
    handleDisconnect(ws);
  });
});

// Handle user login
const handleLogin = (ws: WebSocket, username: string) => {
  usersConnected.set(ws, username);
  userSockets[username] = ws;
  sendUsersConnected();
};

// Handle user kick or ban action
const handleUserAction = async (
  actionType: "kick" | "ban",
  username: string
) => {
  const userSocket = userSockets[username];
  if (!userSocket) {
    console.log(`User ${username} not found`);
    return;
  }

  // Close user's WebSocket connection
  userSocket.close();
  usersConnected.delete(userSocket);
  delete userSockets[username];

  // Call REST API for ban action
  if (actionType === "ban") {
    try {
      await axios.post(`${REST_API_URL}/ban`, {
        username,
        timestamp: new Date().toISOString(),
      });
      console.log(`User ${username} has been banned`);
    } catch (error) {
      console.error("Error banning user:", error);
    }
  }

  // Notify all clients about user list update
  sendUsersConnected();

  // Broadcast kick/ban message
  const actionMessage: Message = {
    type: actionType,
    payload: username,
  };
  broadcastMessage(null, actionMessage);
};

// Handle user disconnection
const handleDisconnect = (ws: WebSocket) => {
  usersConnected.delete(ws);
  sendUsersConnected();
};

// Broadcast message to other clients
const broadcastMessage = (excludeWs: WebSocket | null, message: Message) => {
  const stringifiedMessage = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (
      (!excludeWs || client !== excludeWs) &&
      client.readyState === WebSocket.OPEN
    ) {
      client.send(stringifiedMessage);
    }
  });
};

// Send current online users list
const sendUsersConnected = () => {
  const users = Array.from(usersConnected.values());
  const payload: Message = {
    type: "users",
    payload: JSON.stringify(users),
  };
  broadcastMessage(null, payload);
};

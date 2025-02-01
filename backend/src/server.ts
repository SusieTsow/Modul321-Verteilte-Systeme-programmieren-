import express from "express";
import { db } from "./knex";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.get("/", (req, res) => {
  db.count("* as chat_count")
    .from("ChatLog")
    .then((result) => {
      res.send(`Total chats: ${result[0]["chat_count"]}`);
    });
});

app.get("/chat", (req, res) => {
  db.count("*")
    .from("ChatLog")
    .then((result) => {
      res.send(result);
    });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

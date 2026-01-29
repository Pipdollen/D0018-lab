const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mysql = require("mysql2");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

//create db connection
const db = mysql.createConnection({
  host: "localhost",
  user: "app_user",
  password: "strongpassword",
  database:"SkiShop_db"
});

db.connect(err =>{
  if(err) throw err;
  console.log("MySQL connected");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("message", (msg) => {
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Server running");
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});

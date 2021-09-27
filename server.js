// Setup
const express = require("express");
const path = require("path");
const app = require("./app");
const serverStart = new Date();

// Socket.IO connector
function IoConnect(server) {
  let activeUsers = 0;
  let socketIO = require("socket.io")(server);
  socketIO.on("connection", (socket) => {
    console.log("user connected");
    console.log("UserID = " + (1 + activeUsers));
    socket.emit("init", ++activeUsers);
    socket.on("disconnect", function () {
      activeUsers -= 1;
      console.log("user disconnected");
    });
    socket.on("userID", function (userID) {
      console.log("user gave back id:" + userID);
    });
  });
}

// Server & WebSockets
const server = require("http").createServer(app);
IoConnect(server);

let dataDir = path.resolve(__dirname, "public");
app.use(express.static(dataDir));

let port = process.env.PORT || 3000;
server.listen(port, function () {
  console.log(
    `App prod ${process.env.PROD} listening at ${port} in ${dataDir}`
  );
});

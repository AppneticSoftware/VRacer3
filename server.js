// Setup
const express = require("express");
const path = require("path");
const app = require("./app");
const serverStart = new Date();

// Socket.IO connector
function IoConnect(server) {
  let audienceCounter = 0,
    uniqueCounter = 0;
  let socketIO = require("socket.io")(server);
  socketIO.on("connection", (socket) => {
    console.log("user connected");
    ++audienceCounter;
    socket.on("disconnect", function () {
      --audienceCounter;
      console.log("user disconnected");
    });
    socket.on("heartbeat", function (data) {
      const now = new Date();
      --audienceCounter;
      data.audienceCounter = audienceCounter;
      data.serverRuntime = Math.floor((now - serverStart) / 1000);
      socketIO.sockets.emit("heartbeat", data);
    });
    socket.emit("init", ++uniqueCounter);
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

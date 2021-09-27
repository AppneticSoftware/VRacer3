// Setup
const express = require("express");
const path = require("path");
const app = require("./app");
let userIDs = [];
let roomUserCounter = [
  ["0", "0", "0", "0"], //RoomOne
  ["0", "0", "0", "0"], //RoomTwo
  ["0", "0", "0", "0"], //RoomThree
];

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

//----------------------------------------------------------------------
// Socket.IO connector
function IoConnect(server) {
  let socketIO = require("socket.io")(server);
  socketIO.on("connection", (socket) => {
    sendRoomAvailability(socket);

    //Listener
    listenToDisconnect(socket);
    listenToUserIdSendBack(socket);
    listenToJoinRoom(socket);
  });
}
//Socket Functions - Sender

function sendRoomAvailability(socket) {
  // let roomsMemberCounterArray =
  socket.emit("roomAvailability", getRoomCounters());
}

function sendRoomConformation(socket, roomName) {
  // let roomsMemberCounterArray =
  socket.emit("roomConfirmed", roomName);
}

//Socket Functions - Listener

function listenToDisconnect(socket) {
  socket.on("disconnect", function () {
    console.log("user disconnected " + socket.id);
  });
}

function listenToUserIdSendBack(socket) {
  socket.on("userID", function (userID) {
    console.log("user gave back id:" + userID);
  });
}

function listenToJoinRoom(socket) {
  socket.on("joinRoom", function (roomName) {
    console.log("JoiningRoom: " + roomName);
    sendRoomConformation(socket, roomName);
  });
}

//Generall Functions

function getRoomCounters() {
  const roomsMemberCounterArray = [];
  for (let index = 0; index < roomUserCounter.length; index++) {
    roomsMemberCounterArray[index] = countMembersInRoom(roomUserCounter[index]);
  }

  return roomsMemberCounterArray;
}

function countMembersInRoom(roomArray) {
  const memberAmount = 0;
  for (let index = 0; index < roomArray.length; index++) {
    if (roomArray[index] != "0") {
      memberAmount += 1;
    }
  }
  return memberAmount;
}

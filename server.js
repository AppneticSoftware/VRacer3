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
    console.log(socket.id + " joined the server.");
    sendRoomAvailability(socket);

    //Listener
    listenToDisconnect(socket);
    listenToJoinRoom(socket);
  });
}
//Socket Functions - Sender

function sendRoomAvailability(socket) {
  // let roomsMemberCounterArray =
  socket.emit("roomAvailability", getRoomCounters());
}

function sendRoomPermission(socket, isAllowed) {
  // let roomsMemberCounterArray =
  socket.emit("roomPermission", isAllowed);
}

function sendRoomsUpdateToAllUsers(socket) {
  socket.broadcast.emit("roomAvailability", getRoomCounters());
}

//Socket Functions - Listener

function listenToDisconnect(socket) {
  socket.on("disconnect", function () {
    console.log(socket.id + " disconnected. ");
    //SOCKET ID AUS ROOMS RAUSWERFEN
  });
}

function listenToJoinRoom(socket) {
  socket.on("joinRoom", function (roomName) {
    console.log(socket.id + " is asking to Join Room: " + roomName);
    const isUserAllowedToJoin = isUserAddableToRoom(socket.id, roomName);
    sendRoomPermission(socket, isUserAllowedToJoin);
    sendRoomsUpdateToAllUsers(socket);
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
  let memberAmount = 0;
  for (let index = 0; index < roomArray.length; index++) {
    if (roomArray[index] != "0") {
      memberAmount += 1;
    }
  }
  return memberAmount;
}

function isUserAddableToRoom(userId, roomName) {
  switch (roomName) {
    case "roomOne":
      return isUserAddabletoSpecificRoom(userId, roomUserCounter[0]);
    case "roomTwo":
      return isUserAddabletoSpecificRoom(userId, roomUserCounter[1]);
    case "roomThree":
      return isUserAddabletoSpecificRoom(userId, roomUserCounter[2]);
    default:
      return false;
  }
}

function isUserAddabletoSpecificRoom(userID, roomArray) {
  let userWasAddable = false;
  for (let index = 0; index < roomArray.length; index++) {
    if (roomArray[index] == "0") {
      roomArray[index] = userID;
      userWasAddable = true;
      break;
    }
  }
  return userWasAddable;
}
